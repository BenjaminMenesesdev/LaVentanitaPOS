<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            return response()->json(['message' => 'Cuenta inactiva o no autenticada.'], 403);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'No tienes permiso para esta acción.'], 403);
        }

        return $next($request);
    }
}
