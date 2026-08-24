# Secretos gestionados por AWS Secrets Manager - nunca en variables de entorno planas del
# task definition ni en el repositorio. Las tareas ECS los leen en runtime via el bloque
# "secrets" del container definition (ver ecs.tf), inyectados por el agente de ECS, no por
# Terraform ni por el codigo de la aplicacion.

resource "random_password" "db_password" {
  length  = 32
  special = false # evita caracteres que rompan la connection string de Postgres/JDBC
}

resource "random_bytes" "app_key" {
  length = 32
}

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project_name}/${var.environment}/db-password"
  recovery_window_in_days = 0 # borrado inmediato si se destruye el stack (evita choque de nombres en tests repetidos)
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}

resource "aws_secretsmanager_secret" "app_key" {
  name                    = "${var.project_name}/${var.environment}/app-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "app_key" {
  secret_id = aws_secretsmanager_secret.app_key.id
  # random_bytes.base64 ya son 32 bytes crudos codificados en base64 (formato que Laravel
  # espera exactamente para AES-256-CBC tras decodificar el prefijo "base64:").
  secret_string = "base64:${random_bytes.app_key.base64}"
}
