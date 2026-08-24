FROM nginx:alpine

# En docker-compose.yml local, default.conf se monta como volumen porque hay un host
# disponible. En ECS Fargate no existen host ni volumenes bind-mount, asi que para el
# despliegue en la nube este mismo nginx (el "router" publico: /api -> backend:9000,
# / -> frontend:80) se empaqueta como imagen propia con la configuracion incluida.
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
