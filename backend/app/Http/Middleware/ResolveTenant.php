<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = null;

        if ($request->user() && $request->user()->tenant_id) {
            $tenant = Tenant::withoutGlobalScopes()->find($request->user()->tenant_id);
        } elseif ($request->hasHeader('X-Tenant-Slug')) {
            $tenant = Tenant::withoutGlobalScopes()->where('slug', $request->header('X-Tenant-Slug'))->first();
        }

        if (!$tenant) {
            return response()->json(['message' => 'Tenant no identificado.'], 400);
        }

        if (!$tenant->isActive()) {
            return response()->json(['message' => 'La suscripcion de este negocio no esta activa.'], 402);
        }

        App::instance('currentTenantId', $tenant->id);
        App::instance('currentTenant', $tenant);

        return $next($request);
    }
}
