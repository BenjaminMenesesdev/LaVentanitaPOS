<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimit
{
    public function handle(Request $request, Closure $next, string $resource): Response
    {
        $tenant = App::bound('currentTenant') ? App::make('currentTenant') : null;

        if ($tenant) {
            $exceeded = match ($resource) {
                'products' => $tenant->hasReachedProductLimit(),
                'users' => $tenant->hasReachedUserLimit(),
                default => false,
            };

            if ($exceeded) {
                return response()->json([
                    'message' => "Alcanzaste el limite de {$resource} de tu plan. Actualiza tu suscripcion para continuar.",
                    'plan' => $tenant->plan?->code,
                ], 403);
            }
        }

        return $next($request);
    }
}
