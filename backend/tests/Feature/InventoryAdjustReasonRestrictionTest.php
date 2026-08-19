<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\Plan;
use App\Models\Stock;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class InventoryAdjustReasonRestrictionTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;
    private User $admin;
    private User $operador;
    private Ingredient $ingredient;

    protected function setUp(): void
    {
        parent::setUp();

        $plan = Plan::create([
            'code' => 'esencial',
            'name' => 'Plan Esencial',
            'price_monthly' => 12000,
            'price_yearly' => 144000,
            'max_products' => 3500,
            'max_users' => 10,
            'features' => ['ai_suggestions' => true, 'invoice_scan' => true],
            'is_active' => true,
        ]);

        $this->tenant = Tenant::create([
            'name' => 'Negocio Test', 'slug' => 'negocio-test-inv', 'plan_id' => $plan->id, 'status' => 'active',
        ]);

        $this->admin = User::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Admin',
            'email' => 'admin-inv@test.local', 'password' => 'password123', 'role' => 'admin',
        ]);
        $this->operador = User::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Operador',
            'email' => 'operador-inv@test.local', 'password' => 'password123', 'role' => 'operador',
        ]);

        $this->ingredient = Ingredient::create([
            'name' => 'Helado Vainilla', 'base_unit' => 'ml',
            'current_cost_per_base_unit' => 8.5, 'min_stock_threshold' => 100,
        ]);

        Stock::create([
            'ingredient_id' => $this->ingredient->id, 'location' => 'bodega', 'quantity_base_unit' => 5000,
        ]);
    }

    private function actingAsTenant(User $user): void
    {
        $this->actingAs($user);
        App::instance('currentTenantId', $user->tenant_id);
        App::instance('currentTenant', $user->tenant()->first());
    }

    private function basePayload(array $overrides = []): array
    {
        return array_merge([
            'ingredient_id' => $this->ingredient->id,
            'location' => 'bodega',
            'quantity_delta' => 1000,
            'unit' => 'ml',
            'reason' => 'recepcion',
        ], $overrides);
    }

    public function test_operador_puede_registrar_recepcion_con_cantidad_positiva(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->postJson('/api/stock/adjust', $this->basePayload());

        $response->assertOk();
    }

    public function test_operador_no_puede_registrar_merma(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->postJson('/api/stock/adjust', $this->basePayload([
            'reason' => 'merma',
            'quantity_delta' => -50,
            'justification' => 'Producto derretido',
        ]));

        $response->assertStatus(403);
    }

    public function test_operador_no_puede_registrar_traslado(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->postJson('/api/stock/adjust', $this->basePayload([
            'reason' => 'traslado',
            'location' => 'vitrina',
        ]));

        $response->assertStatus(403);
    }

    public function test_operador_no_puede_registrar_ajuste_manual(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->postJson('/api/stock/adjust', $this->basePayload([
            'reason' => 'ajuste_manual',
            'justification' => 'Correccion de conteo',
        ]));

        $response->assertStatus(403);
    }

    public function test_operador_no_puede_registrar_recepcion_con_cantidad_negativa(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->postJson('/api/stock/adjust', $this->basePayload([
            'reason' => 'recepcion',
            'quantity_delta' => -200,
        ]));

        $response->assertStatus(403);
    }

    public function test_admin_puede_registrar_cualquier_reason_valido(): void
    {
        $this->actingAsTenant($this->admin);

        $merma = $this->postJson('/api/stock/adjust', $this->basePayload([
            'reason' => 'merma',
            'quantity_delta' => -50,
            'justification' => 'Producto vencido',
        ]));
        $merma->assertOk();

        $traslado = $this->postJson('/api/stock/adjust', $this->basePayload([
            'reason' => 'traslado',
            'quantity_delta' => 100,
            'location' => 'vitrina',
        ]));
        $traslado->assertOk();
    }

    public function test_reason_invalido_es_rechazado_por_validacion_antes_de_llegar_al_controller(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->postJson('/api/stock/adjust', $this->basePayload([
            'reason' => 'compra',
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['reason']);
    }
}
