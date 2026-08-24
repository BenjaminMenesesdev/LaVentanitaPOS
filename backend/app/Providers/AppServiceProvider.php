<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Limitador "api" requerido por $middleware->throttleApi() en bootstrap/app.php.
        // Sin este registro, TODA petición autenticada a la API respondía 500
        // (MissingRateLimiterException). Se limita por usuario autenticado o,
        // si no hay sesión, por IP, para mitigar fuerza bruta / DoS a nivel de aplicación.
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
    }
}
