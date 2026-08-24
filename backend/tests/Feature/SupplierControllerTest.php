<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class SupplierControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $admin;

    private User $operador;

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
            'name' => 'Negocio Test', 'slug' => 'negocio-test', 'plan_id' => $plan->id, 'status' => 'active',
        ]);

        $this->admin = User::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Admin Principal',
            'email' => 'admin@test.local', 'password' => 'password123', 'role' => 'admin',
        ]);
        $this->operador = User::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Operador Uno',
            'email' => 'operador@test.local', 'password' => 'password123', 'role' => 'operador',
        ]);
    }

    private function actingAsTenant(User $user): void
    {
        $this->actingAs($user);
        App::instance('currentTenantId', $user->tenant_id);
        App::instance('currentTenant', $user->tenant()->first());
    }

    public function test_admin_puede_listar_proveedores(): void
    {
        $this->actingAsTenant($this->admin);
        Supplier::create(['name' => 'Distribuidora Lactea']);

        $response = $this->getJson('/api/suppliers');

        $response->assertOk();
        $this->assertCount(1, $response->json());
    }

    public function test_admin_puede_crear_proveedor(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->postJson('/api/suppliers', [
            'name' => 'Distribuidora Lactea',
            'contact_name' => 'Juan Perez',
            'phone' => '+56912345678',
            'email' => 'contacto@lactea.cl',
            'avg_lead_time_days' => 3,
            'no_delivery_days' => [0, 6],
            'min_order_amount' => 50000,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Distribuidora Lactea',
            'tenant_id' => $this->tenant->id,
        ]);
    }

    public function test_operador_no_puede_crear_proveedores(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->postJson('/api/suppliers', [
            'name' => 'Intento Operador',
            'avg_lead_time_days' => 1,
            'min_order_amount' => 0,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('suppliers', ['name' => 'Intento Operador']);
    }

    public function test_creacion_de_proveedor_valida_campos_requeridos(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->postJson('/api/suppliers', ['contact_name' => 'Sin nombre']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'avg_lead_time_days', 'min_order_amount']);
    }

    public function test_admin_puede_actualizar_un_proveedor(): void
    {
        $this->actingAsTenant($this->admin);
        $supplier = Supplier::create(['name' => 'Nombre Original', 'avg_lead_time_days' => 2, 'min_order_amount' => 10000]);

        $response = $this->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Nombre Actualizado',
            'avg_lead_time_days' => 5,
            'min_order_amount' => 20000,
        ]);

        $response->assertOk();
        $this->assertSame('Nombre Actualizado', $supplier->fresh()->name);
        $this->assertSame(5, $supplier->fresh()->avg_lead_time_days);
    }

    public function test_operador_no_puede_actualizar_proveedores(): void
    {
        $this->actingAsTenant($this->admin);
        $supplier = Supplier::create(['name' => 'Proveedor', 'avg_lead_time_days' => 1, 'min_order_amount' => 0]);

        $this->actingAsTenant($this->operador);
        $response = $this->putJson("/api/suppliers/{$supplier->id}", ['name' => 'Hackeado']);

        $response->assertForbidden();
        $this->assertSame('Proveedor', $supplier->fresh()->name);
    }

    public function test_admin_puede_eliminar_un_proveedor_sin_ordenes_de_compra(): void
    {
        $this->actingAsTenant($this->admin);
        $supplier = Supplier::create(['name' => 'Proveedor Sin Uso', 'avg_lead_time_days' => 1, 'min_order_amount' => 0]);

        $response = $this->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }

    public function test_no_se_puede_eliminar_un_proveedor_con_ordenes_de_compra_asociadas(): void
    {
        $this->actingAsTenant($this->admin);
        $supplier = Supplier::create(['name' => 'Proveedor Con Ordenes', 'avg_lead_time_days' => 1, 'min_order_amount' => 0]);
        PurchaseOrder::create([
            'supplier_id' => $supplier->id, 'created_by' => $this->admin->id,
            'status' => 'pendiente', 'total_amount' => 5000,
        ]);

        $response = $this->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
    }

    public function test_operador_no_puede_eliminar_proveedores(): void
    {
        $this->actingAsTenant($this->admin);
        $supplier = Supplier::create(['name' => 'Proveedor', 'avg_lead_time_days' => 1, 'min_order_amount' => 0]);

        $this->actingAsTenant($this->operador);
        $response = $this->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
    }

    public function test_proveedores_estan_aislados_por_tenant(): void
    {
        $this->actingAsTenant($this->admin);
        $supplierA = Supplier::create(['name' => 'Proveedor Tenant A']);

        $otherTenant = Tenant::create([
            'name' => 'Otro Negocio', 'slug' => 'otro-negocio', 'plan_id' => $this->tenant->plan_id, 'status' => 'active',
        ]);
        $adminB = User::create([
            'tenant_id' => $otherTenant->id, 'name' => 'Admin B',
            'email' => 'admin-b@test.local', 'password' => 'password123', 'role' => 'admin',
        ]);

        $this->actingAsTenant($adminB);

        $response = $this->getJson('/api/suppliers');
        $response->assertOk();
        $this->assertCount(0, $response->json());

        $showResponse = $this->getJson("/api/suppliers/{$supplierA->id}");
        $showResponse->assertNotFound();
    }
}
