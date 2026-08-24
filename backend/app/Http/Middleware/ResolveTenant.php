<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = null;

        if ($request->user() && $request->user()->tenant_id) {
            $tenant = Tenant::withoutGlobalScopes()->find($request->user()->tenant_id);
        } elseif ($request->hasHeader('X-Tenant-Slug')) {
            if (! $request->user() || ! $request->user()->isSuperAdmin()) {
                return response()->json(['message' => 'No autorizado para seleccionar tenant via header.'], 403);
            }

            $slug = $request->header('X-Tenant-Slug');
            $tenant = Tenant::withoutGlobalScopes()->where('slug', $slug)->first();

            if ($tenant) {
                Log::warning('tenant_impersonation', [
                    'super_admin_id' => $request->user()->id,
                    'super_admin_email' => $request->user()->email,
                    'impersonated_tenant_id' => $tenant->id,
                    'impersonated_tenant_slug' => $tenant->slug,
                    'ip' => $request->ip(),
                ]);
            }
        }

        if (! $tenant) {
            return response()->json(['message' => 'Tenant no identificado.'], 400);
        }

        if (! $tenant->isActive()) {
            return response()->json(['message' => 'La suscripcion de este negocio no esta activa.'], 402);
        }

        App::instance('currentTenantId', $tenant->id);
        App::instance('currentTenant', $tenant);

        return $next($request);
    }
}
