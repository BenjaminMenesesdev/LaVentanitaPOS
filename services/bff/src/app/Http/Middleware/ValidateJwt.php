<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\Request;

class ValidateJwt
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
        return $next($request);
    }
}