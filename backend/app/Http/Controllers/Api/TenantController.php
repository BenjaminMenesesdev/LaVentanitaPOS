<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TenantController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_name' => ['required', 'string', 'max:150'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:tenants,slug'],
            'plan_code' => ['required', 'string', 'exists:plans,code'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'admin_name' => ['required', 'string', 'max:100'],
            'admin_email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'admin_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan = Plan::where('code', $request->plan_code)->firstOrFail();

        $result = DB::transaction(function () use ($request, $plan) {
            $tenant = Tenant::create([
                'name' => $request->business_name,
                'slug' => $request->slug,
                'plan_id' => $plan->id,
                'billing_cycle' => $request->billing_cycle,
                'status' => 'trial',
                'trial_ends_at' => now()->addDays(14),
            ]);

            $admin = User::create([
                'tenant_id' => $tenant->id,
                'name' => $request->admin_name,
                'email' => $request->admin_email,
                'password' => $request->admin_password,
                'role' => 'admin',
            ]);

            return [$tenant, $admin];
        });

        [$tenant, $admin] = $result;

        AuditService::log('tenant.register', 'Tenant', $tenant->id, ['plan' => $plan->code]);

        $token = $admin->createToken('auth_token', ['*'], now()->addHours(12));

        return response()->json([
            'tenant' => $tenant->load('plan'),
            'token' => $token->plainTextToken,
            'user' => $admin->only(['id', 'name', 'email', 'role']),
        ], 201);
    }

    public function current(Request $request)
    {
        $tenant = $request->user()->tenant()->with('plan')->first();

        return response()->json([
            'tenant' => $tenant,
            'usage' => [
                'products' => $tenant->currentProductCount(),
                'users' => $tenant->currentUserCount(),
                'max_products' => $tenant->plan?->max_products,
                'max_users' => $tenant->plan?->max_users,
            ],
        ]);
    }
}
