variable "aws_region" {
  description = "Region de AWS donde se despliega toda la infraestructura."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre corto del proyecto, usado como prefijo en todos los recursos."
  type        = string
  default     = "laventanita"
}

variable "environment" {
  description = "Nombre del ambiente (prod, staging, etc.)."
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "Bloque CIDR de la VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "availability_zones" {
  description = "Zonas de disponibilidad a usar (minimo 2 para alta disponibilidad de ALB/RDS)."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "db_name" {
  description = "Nombre de la base de datos Postgres."
  type        = string
  default     = "laventanita"
}

variable "db_username" {
  description = "Usuario administrador de la base de datos."
  type        = string
  default     = "laventanita_user"
}

variable "db_instance_class" {
  description = "Clase de instancia RDS. db.t4g.micro es apto para capa gratuita / cargas bajas de un POS pequeno."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Almacenamiento inicial en GB para RDS."
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Si true, despliega RDS en Multi-AZ para alta disponibilidad (mayor costo). Recomendado true en produccion real."
  type        = bool
  default     = false
}

variable "backend_cpu" {
  description = "CPU (unidades Fargate) para la tarea de backend."
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memoria (MB) para la tarea de backend."
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  type    = number
  default = 256
}

variable "frontend_memory" {
  type    = number
  default = 512
}

variable "nginx_cpu" {
  type    = number
  default = 256
}

variable "nginx_memory" {
  type    = number
  default = 512
}

variable "backend_desired_count" {
  description = "Cantidad de tareas backend en paralelo. >=2 evita downtime durante despliegues rolling."
  type        = number
  default     = 2
}

variable "frontend_desired_count" {
  type    = number
  default = 2
}

variable "nginx_desired_count" {
  type    = number
  default = 2
}

variable "frontend_url" {
  description = "URL publica del frontend (usada por Laravel para CORS/Sanctum). Ajustar tras crear el ALB o dominio propio."
  type        = string
  default     = ""
}

variable "sanctum_stateful_domains" {
  description = "Dominios permitidos para autenticacion stateful de Sanctum (SPA). Ajustar al dominio real del ALB/CloudFront/Route53."
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "Repositorio de GitHub en formato owner/repo, usado para restringir el rol OIDC de CI/CD a este repositorio unicamente."
  type        = string
  default     = "BenjaminMenesesdev/LaVentanitaPOS"
}

variable "log_retention_days" {
  description = "Dias de retencion de logs en CloudWatch."
  type        = number
  default     = 30
}
