FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev libzip-dev zip unzip curl bash git \
    && docker-php-ext-install pdo pdo_pgsql zip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

COPY . .

# Sin composer.lock todavia: se resuelve contra Packagist en build (no usar --prefer-dist sin lock)
RUN composer install --no-dev --no-interaction --no-scripts --optimize-autoloader \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

USER www-data
EXPOSE 9000
CMD ["php-fpm"]
