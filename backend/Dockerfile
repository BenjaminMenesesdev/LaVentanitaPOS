FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev libzip-dev zip unzip curl bash git \
    && docker-php-ext-install pdo pdo_pgsql zip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

COPY . .

# --no-scripts evita ejecutar scripts arbitrarios del lock file durante el build (superficie de
# ataque de supply-chain). Como contrapartida, el discovery cache de paquetes (bootstrap/cache/
# packages.php|services.php) no se regenera solo: si el working dir local traia un cache generado
# en un entorno con dependencias dev (composer install completo, sin --no-dev), ese cache stale
# quedaria copiado por "COPY . ." apuntando a proveedores que no existen en esta imagen
# (--no-dev), rompiendo el boot en produccion. Por eso se borra cualquier cache heredado y se
# regenera explicitamente aqui, ya con el set de dependencias real de produccion.
RUN composer install --no-dev --no-interaction --no-scripts --optimize-autoloader \
    && rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php bootstrap/cache/routes-v7.php \
    && php artisan package:discover --ansi \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

USER www-data
EXPOSE 9000
CMD ["php-fpm"]
