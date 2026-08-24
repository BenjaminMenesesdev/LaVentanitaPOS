terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # Backend remoto recomendado para no perder el state (ajusta bucket/tabla a tu cuenta AWS
  # antes del primer `terraform init`). Se deja comentado porque requiere recursos
  # pre-existentes (bucket S3 + tabla DynamoDB para locking) que este mismo Terraform no crea,
  # para evitar el problema de "el bootstrap necesita bootstrap".
  #
  # backend "s3" {
  #   bucket         = "laventanita-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "laventanita-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
