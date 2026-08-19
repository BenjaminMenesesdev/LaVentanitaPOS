FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

# Vite congela las variables VITE_* en tiempo de build (npm run build).
# El bloque "environment:" del docker-compose.yml NO llega a este stage intermedio
# (solo aplica al contenedor final en runtime), por eso se declara como ARG y se
# vuelca a ENV antes de compilar. Ver docker-compose.yml -> frontend -> build.args.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
