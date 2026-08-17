<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanFeature
{
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        $tenant = App::bound('currentTenant') ? App::make('currentTenant') : null;

        if (!$tenant || !$tenant->hasFeature($featureKey)) {
            return response()->json([
                'message' => 'Esta funcion no esta disponible en tu plan actual.',
                'required_feature' => $featureKey,
            ], 403);
        }

        return $next($request);
    }
}
