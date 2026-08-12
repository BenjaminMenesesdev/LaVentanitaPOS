FROM php:8.2-fpm
RUN apt-get update && apt-get install -y git curl zip unzip libpq-dev && docker-php-ext-install pdo_pgsql
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY . /var/www
RUN mkdir -p bootstrap/cache src/storage && chmod -R 777 bootstrap/cache src/storage
RUN composer install --no-interaction --optimize-autoloader
EXPOSE 8000
CMD php artisan serve --host=0.0.0.0 --port=8000
