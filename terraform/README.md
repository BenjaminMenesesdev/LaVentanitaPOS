# Infraestructura AWS - LaVentanitaPOS

Terraform que provisiona la infraestructura de produccion en AWS: VPC con subredes
publicas/privadas, RDS Postgres (privado, sin acceso a internet), ECS Fargate con 3
servicios (nginx router publico detras de un ALB, backend Laravel, frontend React estatico),
ECR para las 3 imagenes, y un rol IAM con OIDC para que GitHub Actions despliegue sin
credenciales de AWS de larga duracion.

## Arquitectura

```
Internet -> ALB (puerto 80, HTTPS listo para activar) -> ECS Service "nginx" (subred privada)
                                                              |
                                              Service Connect (DNS interno del cluster)
                                                   /                        \
                                    ECS Service "backend"           ECS Service "frontend"
                                    (php-fpm :9000)                 (React estatico :80)
                                          |
                                    RDS Postgres 15 (subred privada, TLS forzado,
                                    sin IP publica, solo alcanzable desde las tareas ECS)
```

Es el mismo diseño que `docker-compose.yml` (nginx -> backend:9000 / frontend:80 -> db),
adaptado a servicios separados de ECS con Service Connect en vez de una red bridge de Docker.

## Requisitos previos

1. Cuenta de AWS con permisos de administrador (para el `apply` inicial).
2. AWS CLI configurado localmente (`aws configure`) o variables `AWS_ACCESS_KEY_ID` /
   `AWS_SECRET_ACCESS_KEY` / `AWS_DEFAULT_REGION` exportadas.
3. Terraform >= 1.6 (`terraform version`).
4. (Recomendado) Backend remoto S3 + DynamoDB para el state - ver el bloque comentado en
   `versions.tf`. Sin esto, el state queda solo en tu maquina local (`terraform.tfstate`),
   lo cual es aceptable para un solo desarrollador pero riesgoso si varias personas aplican.

## Primer despliegue (una sola vez, manual)

```bash
cd terraform
terraform init
terraform plan   # revisa los ~40 recursos que se van a crear
terraform apply
```

Esto crea la infraestructura, PERO los 3 servicios ECS arrancan con una imagen placeholder
publica (`httpd:alpine`) solo para que los servicios existan - la aplicacion real todavia no
esta desplegada. El primer deploy real de la app lo hace el pipeline de CI/CD
(`.github/workflows/deploy.yml`) en el primer push a `main` despues de configurar los
secrets de GitHub (ver abajo).

Al terminar el `apply`, copia estos outputs:

```bash
terraform output
```

- `alb_dns_name` -> URL publica de la app (o crea un CNAME/Route53 alias apuntando aqui).
- `github_actions_role_arn` -> se usa como secret `AWS_ROLE_ARN` en GitHub.
- `ecs_cluster_name`, `ecr_*_repository_url` -> usados por el workflow de CD.

## Configurar GitHub Actions (una sola vez)

En Settings -> Secrets and variables -> Actions del repositorio, agregar:

| Nombre | Valor | Tipo |
|---|---|---|
| `AWS_ROLE_ARN` | output `github_actions_role_arn` | Secret |
| `AWS_REGION` | `us-east-1` (o el valor de `var.aws_region`) | Variable |
| `ECS_CLUSTER` | output `ecs_cluster_name` | Variable |

No se necesita ningun `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` - el workflow asume
`AWS_ROLE_ARN` via OIDC (ver `iam.tf`, rol restringido a este repositorio unicamente).

## Tras el primer deploy real: apuntar FRONTEND_URL/SANCTUM_STATEFUL_DOMAINS

Una vez que tengas un dominio propio (o decidas usar el DNS del ALB directamente), actualiza
`var.frontend_url` y `var.sanctum_stateful_domains` en un `terraform.tfvars` y vuelve a
aplicar:

```hcl
# terraform.tfvars
frontend_url             = "https://tudominio.cl"
sanctum_stateful_domains = "tudominio.cl"
```

## Activar HTTPS

1. Solicitar/validar un certificado en AWS Certificate Manager para tu dominio.
2. Descomentar el bloque `aws_lb_listener.https` en `alb.tf` y poner el ARN del certificado.
3. Cambiar `aws_lb_listener.http.default_action` a un `redirect` 301 hacia HTTPS (instrucciones
   en el comentario de `alb.tf`).
4. `terraform apply`.

## Migraciones de base de datos en produccion

El pipeline de CD corre `php artisan migrate --force` (NO `migrate:fresh`, que borraria
todos los datos) como una tarea ECS one-off antes de actualizar los servicios, usando
`aws ecs run-task` con la imagen de backend recien construida. Ver el job `migrate` en
`.github/workflows/deploy.yml`.

## Costos aproximados (referencia, region us-east-1, uso bajo)

- NAT Gateway: ~US$32/mes + trafico.
- RDS `db.t4g.micro` single-AZ: ~US$12-15/mes.
- ALB: ~US$16/mes + LCU.
- Fargate (6 tareas pequenas, 256 CPU/512 MB, `desired_count=2` por servicio): ~US$25-35/mes.
- ECR/CloudWatch/Secrets Manager: unos pocos dolares/mes.

Total estimado: ~US$90-110/mes para este dimensionamiento. Para reducir costo en un ambiente
de pruebas, bajar `*_desired_count` a 1 y `db_instance_class` sigue en el tier mas barato.

## Destruir todo

```bash
terraform destroy
```

`deletion_protection` en RDS y `enable_deletion_protection` en el ALB estan condicionados a
`var.environment == "prod"` - en `prod` hay que desactivarlos manualmente antes de poder
destruir (proteccion intencional contra un `destroy` accidental).
