resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Service Connect: descubrimiento de servicios por nombre DNS interno (backend, frontend)
# dentro del cluster, equivalente a los nombres de servicio de docker-compose ("db",
# "backend", "frontend") que la app ya usa via variables de entorno / nginx.conf.
resource "aws_service_discovery_http_namespace" "main" {
  name = "${var.project_name}-${var.environment}"
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}/backend"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}-${var.environment}/frontend"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/ecs/${var.project_name}-${var.environment}/nginx"
  retention_in_days = var.log_retention_days
}

locals {
  # Imagen "placeholder" publica usada SOLO para poder crear los servicios ECS en el primer
  # `terraform apply`, antes de que exista ninguna imagen real en ECR (el pipeline de CI/CD
  # hace el primer deploy real reemplazando esta imagen via `ecs update-service` con la
  # imagen que construye desde backend/Dockerfile, frontend/Dockerfile, nginx). Ver README.md.
  placeholder_image = "public.ecr.aws/docker/library/httpd:alpine"
}

# --- Backend (Laravel / php-fpm) --------------------------------------------

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name         = "backend"
    image        = local.placeholder_image
    portMappings = [{ containerPort = 9000, protocol = "tcp" }]
    environment = [
      { name = "APP_ENV", value = var.environment == "prod" ? "production" : var.environment },
      { name = "APP_DEBUG", value = "false" },
      { name = "DB_CONNECTION", value = "pgsql" },
      { name = "DB_HOST", value = aws_db_instance.main.address },
      { name = "DB_PORT", value = "5432" },
      { name = "DB_DATABASE", value = var.db_name },
      { name = "DB_USERNAME", value = var.db_username },
      { name = "SANCTUM_STATEFUL_DOMAINS", value = var.sanctum_stateful_domains },
      { name = "FRONTEND_URL", value = var.frontend_url },
    ]
    secrets = [
      { name = "DB_PASSWORD", valueFrom = aws_secretsmanager_secret.db_password.arn },
      { name = "APP_KEY", valueFrom = aws_secretsmanager_secret.app_key.arn },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.main.arn

    service {
      port_name      = "backend-9000"
      discovery_name = "backend"
      client_alias {
        port     = 9000
        dns_name = "backend"
      }
    }
  }

  # El primer deploy real (imagen de la app, no el placeholder) lo hace el pipeline de CD via
  # `aws ecs update-service`, no Terraform - evita que cambios de infra vuelvan a desplegar
  # una imagen vieja por accidente.
  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_db_instance.main]
}

# --- Frontend (React estatico servido por nginx) ----------------------------

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name         = "frontend"
    image        = local.placeholder_image
    portMappings = [{ containerPort = 80, protocol = "tcp" }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "frontend"
      }
    }
  }])
}

resource "aws_ecs_service" "frontend" {
  name            = "frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.main.arn

    service {
      port_name      = "frontend-80"
      discovery_name = "frontend"
      client_alias {
        port     = 80
        dns_name = "frontend"
      }
    }
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}

# --- Nginx (router publico: unico servicio detras del ALB) ------------------

resource "aws_ecs_task_definition" "nginx" {
  family                   = "${var.project_name}-nginx"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.nginx_cpu
  memory                   = var.nginx_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name         = "nginx"
    image        = local.placeholder_image
    portMappings = [{ containerPort = 80, protocol = "tcp" }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.nginx.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "nginx"
      }
    }
  }])
}

resource "aws_ecs_service" "nginx" {
  name            = "nginx"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.nginx.arn
  desired_count   = var.nginx_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.main.arn
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.nginx.arn
    container_name   = "nginx"
    container_port   = 80
  }

  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_lb_listener.http]
}
