<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyApiKey
{
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('X-API-Key');
        $expectedKey = env('INTERNAL_API_KEY');

        if (empty($apiKey) || $apiKey !== $expectedKey) {
            return response()->json(['error' => 'Invalid API Key'], 401);
        }

        return $next($request);
    }
}