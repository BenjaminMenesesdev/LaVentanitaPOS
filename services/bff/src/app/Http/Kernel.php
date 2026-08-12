<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $routeMiddleware = [
        'auth.api' => \App\Http\Middleware\ValidateJwt::class,
        'api.key' => \App\Http\Middleware\VerifyApiKey::class,
    ];
}
