<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $routeMiddleware = [
        'api.key' => \App\Http\Middleware\VerifyApiKey::class,
    ];
}
