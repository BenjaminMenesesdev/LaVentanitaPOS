<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PlanSeeder::class);

        $plan = Plan::where('code', 'esencial')->first();

        $tenant = Tenant::create([
            'name' => 'Negocio Demo',
            'slug' => 'negocio-demo',
            'plan_id' => $plan->id,
            'billing_cycle' => 'monthly',
            'status' => 'trial',
            'trial_ends_at' => now()->addDays(14),
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Administrador',
            'email' => 'admin@demo.local',
            'password' => 'CambiarInmediatamente123!',
            'role' => 'admin',
        ]);
    }
}
