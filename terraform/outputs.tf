output "alb_dns_name" {
  description = "DNS publico del ALB. Usar este valor (o un CNAME/A-ALIAS propio apuntando aqui) como FRONTEND_URL/SANCTUM_STATEFUL_DOMAINS y como URL de la app."
  value       = aws_lb.main.dns_name
}

output "ecr_backend_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecr_nginx_repository_url" {
  value = aws_ecr_repository.nginx.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "rds_endpoint" {
  value     = aws_db_instance.main.address
  sensitive = false
}

output "github_actions_role_arn" {
  description = "ARN a configurar como AWS_ROLE_ARN en los secrets/vars del repositorio de GitHub para que el workflow de CD pueda autenticarse via OIDC."
  value       = aws_iam_role.github_actions.arn
}
