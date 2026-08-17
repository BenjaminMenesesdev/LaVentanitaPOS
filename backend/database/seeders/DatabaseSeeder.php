<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use App\Models\Plan;
use App\Models\Product;
use App\Models\RecipeItem;
use App\Models\Supplier;
use App\Models\Tenant;
use App\Models\UnitConversion;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PlanSeeder::class);

        $iaPlan = Plan::where('code', 'ia')->first();

        $tenant = Tenant::create([
            'name' => 'La Ventanita',
            'slug' => 'la-ventanita',
            'plan_id' => $iaPlan->id,
            'billing_cycle' => 'monthly',
            'status' => 'active',
            'current_period_ends_at' => now()->addMonth(),
        ]);

        $admin = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Administrador',
            'email' => 'admin@laventanita.cl',
            'password' => 'CambiarInmediatamente123!',
            'role' => 'admin',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Cajero Demo',
            'email' => 'cajero@laventanita.cl',
            'password' => 'CambiarInmediatamente123!',
            'role' => 'cajero',
        ]);

        UnitConversion::insert([
            ['unit_name' => 'bacha_18L', 'base_unit' => 'ml', 'factor_to_base' => 18000, 'created_at' => now(), 'updated_at' => now()],
            ['unit_name' => 'litro', 'base_unit' => 'ml', 'factor_to_base' => 1000, 'created_at' => now(), 'updated_at' => now()],
            ['unit_name' => 'kilo', 'base_unit' => 'g', 'factor_to_base' => 1000, 'created_at' => now(), 'updated_at' => now()],
            ['unit_name' => 'saco_barquillos_x100', 'base_unit' => 'unidad', 'factor_to_base' => 100, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $mondoGelato = Supplier::create([
            'tenant_id' => $tenant->id,
            'name' => 'Mondo Gelato',
            'avg_lead_time_days' => 2,
            'no_delivery_days' => [0],
            'min_order_amount' => 50000,
        ]);

        $heladoArtesanal = Ingredient::create([
            'tenant_id' => $tenant->id,
            'name' => 'Helado',
            'base_unit' => 'ml',
            'supplier_id' => $mondoGelato->id,
            'current_cost_per_base_unit' => 8.5,
            'min_stock_threshold' => 36000,
        ]);

        $barquillo = Ingredient::create([
            'tenant_id' => $tenant->id,
            'name' => 'Barquillo',
            'base_unit' => 'unidad',
            'current_cost_per_base_unit' => 120,
            'min_stock_threshold' => 50,
        ]);

        $product = Product::create([
            'tenant_id' => $tenant->id,
            'name' => 'Helado Doble en Cono',
            'sale_price' => 2500,
            'is_composite' => true,
        ]);

        RecipeItem::insert([
            ['product_id' => $product->id, 'ingredient_id' => $heladoArtesanal->id, 'quantity_base_unit' => 120, 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => $product->id, 'ingredient_id' => $barquillo->id, 'quantity_base_unit' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
