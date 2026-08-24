<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Ingredient;
use App\Models\InvoiceScan;
use App\Models\Plan;
use App\Models\PriceSuggestion;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\ShiftClosure;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenantA;

    private Tenant $tenantB;

    private User $adminA;

    private User $adminB;

    protected function setUp(): void
    {
        parent::setUp();

        $plan = Plan::create([
            'code' => 'esencial',
            'name' => 'Plan Esencial',
            'price_monthly' => 12000,
            'price_yearly' => 144000,
            'max_products' => 3500,
            'max_users' => 2,
            'features' => ['ai_suggestions' => true, 'invoice_scan' => true],
            'is_active' => true,
        ]);

        $this->tenantA = Tenant::create([
            'name' => 'Negocio A', 'slug' => 'negocio-a', 'plan_id' => $plan->id, 'status' => 'active',
        ]);
        $this->tenantB = Tenant::create([
            'name' => 'Negocio B', 'slug' => 'negocio-b', 'plan_id' => $plan->id, 'status' => 'active',
        ]);

        $this->adminA = User::create([
            'tenant_id' => $this->tenantA->id, 'name' => 'Admin A',
            'email' => 'admin-a@test.local', 'password' => 'password123', 'role' => 'admin',
        ]);
        $this->adminB = User::create([
            'tenant_id' => $this->tenantB->id, 'name' => 'Admin B',
            'email' => 'admin-b@test.local', 'password' => 'password123', 'role' => 'admin',
        ]);
    }

    private function actingAsTenant(User $user): void
    {
        $this->actingAs($user);
        App::instance('currentTenantId', $user->tenant_id);
        App::instance('currentTenant', $user->tenant()->first());
    }

    public function test_product_de_tenant_a_no_es_visible_para_tenant_b(): void
    {
        $this->actingAsTenant($this->adminA);
        $productA = Product::create(['name' => 'Helado A', 'sale_price' => 2000]);

        $this->actingAsTenant($this->adminB);
        $visible = Product::find($productA->id);

        $this->assertNull($visible, 'Tenant B no debe poder leer un producto de Tenant A.');
        $this->assertSame(0, Product::count(), 'El listado de productos de Tenant B debe estar vacio.');
    }

    public function test_stock_de_tenant_a_no_es_visible_para_tenant_b(): void
    {
        $this->actingAsTenant($this->adminA);
        $ingredientA = Ingredient::create(['name' => 'Helado', 'base_unit' => 'ml', 'current_cost_per_base_unit' => 8.5, 'min_stock_threshold' => 100]);
        Stock::create(['ingredient_id' => $ingredientA->id, 'location' => 'vitrina', 'quantity_base_unit' => 5000]);

        $this->actingAsTenant($this->adminB);

        $this->assertSame(0, Stock::count(), 'Tenant B no debe ver stock de Tenant A (regresion del hallazgo critico).');
        $this->assertSame(0, Ingredient::count());
    }

    public function test_stock_movement_de_tenant_a_no_es_visible_para_tenant_b(): void
    {
        $this->actingAsTenant($this->adminA);
        $ingredientA = Ingredient::create(['name' => 'Helado', 'base_unit' => 'ml', 'current_cost_per_base_unit' => 8.5, 'min_stock_threshold' => 100]);
        $stockA = Stock::create(['ingredient_id' => $ingredientA->id, 'location' => 'vitrina', 'quantity_base_unit' => 5000]);
        StockMovement::create([
            'ingredient_id' => $ingredientA->id, 'location' => 'vitrina',
            'quantity_delta_base_unit' => -100, 'reason' => 'venta', 'user_id' => $this->adminA->id,
        ]);

        $this->actingAsTenant($this->adminB);

        $this->assertSame(0, StockMovement::count(), 'Tenant B no debe ver movimientos de stock de Tenant A.');
    }

    public function test_sale_de_tenant_a_no_es_visible_ni_accesible_para_tenant_b(): void
    {
        $this->actingAsTenant($this->adminA);
        $saleA = Sale::create([
            'user_id' => $this->adminA->id, 'gross_total' => 2000, 'commission_amount' => 0,
            'net_total' => 2000, 'cost_total' => 500, 'payment_method' => 'efectivo', 'status' => 'completada',
        ]);

        $this->actingAsTenant($this->adminB);

        $this->assertSame(0, Sale::count());
        $this->assertNull(Sale::find($saleA->id), 'Route model binding debe devolver 404 para una venta de otro tenant.');
    }

    public function test_invoice_scan_y_price_suggestion_no_cruzan_tenants(): void
    {
        $this->actingAsTenant($this->adminA);
        $supplierA = Supplier::create(['name' => 'Proveedor A']);
        $scanA = InvoiceScan::create([
            'supplier_id' => $supplierA->id, 'uploaded_by' => $this->adminA->id,
            'file_path' => 'invoices/test.pdf', 'status' => 'pendiente',
        ]);

        $productA = Product::create(['name' => 'Helado A', 'sale_price' => 2000, 'is_composite' => true]);
        $suggestionA = PriceSuggestion::create([
            'product_id' => $productA->id, 'current_price' => 2000, 'suggested_price' => 2500,
            'reason' => 'test', 'status' => 'pendiente',
        ]);

        $this->actingAsTenant($this->adminB);

        $this->assertSame(0, InvoiceScan::count(), 'Tenant B no debe ver facturas escaneadas de Tenant A.');
        $this->assertSame(0, PriceSuggestion::count(), 'Tenant B no debe ver sugerencias de precio de Tenant A.');
        $this->assertNull(InvoiceScan::find($scanA->id), 'IDOR: no debe poder acceder a la factura de otro tenant por ID.');
        $this->assertNull(PriceSuggestion::find($suggestionA->id), 'IDOR: no debe poder aplicar/descartar sugerencias de otro tenant.');
    }

    public function test_shift_closure_purchase_order_y_audit_log_no_cruzan_tenants(): void
    {
        $this->actingAsTenant($this->adminA);
        ShiftClosure::create([
            'user_id' => $this->adminA->id, 'shift_date' => now()->toDateString(),
            'expected_cash' => 10000, 'counted_cash' => 10000, 'difference' => 0,
        ]);
        $supplierA = Supplier::create(['name' => 'Proveedor A']);
        PurchaseOrder::create(['supplier_id' => $supplierA->id, 'created_by' => $this->adminA->id, 'status' => 'pendiente', 'total_amount' => 5000]);
        AuditLog::create(['user_id' => $this->adminA->id, 'action' => 'test.action', 'entity_type' => 'Test', 'entity_id' => 1]);

        $this->actingAsTenant($this->adminB);

        $this->assertSame(0, ShiftClosure::count(), 'Tenant B no debe ver cierres de caja de Tenant A.');
        $this->assertSame(0, PurchaseOrder::count(), 'Tenant B no debe ver ordenes de compra de Tenant A.');
        $this->assertSame(0, AuditLog::count(), 'Tenant B no debe ver el log de auditoria de Tenant A.');
    }

    public function test_creating_un_registro_asigna_automaticamente_el_tenant_activo(): void
    {
        $this->actingAsTenant($this->adminA);

        $product = Product::create(['name' => 'Producto sin tenant explicito', 'sale_price' => 1000]);

        $this->assertSame($this->tenantA->id, $product->tenant_id);
    }

    public function test_product_ranking_no_expone_datos_de_otro_tenant(): void
    {
        $this->actingAsTenant($this->adminB);
        $productB = Product::create(['name' => 'Producto B', 'sale_price' => 3000]);

        $this->actingAsTenant($this->adminA);
        $productA = Product::create(['name' => 'Producto A', 'sale_price' => 2000]);

        $response = $this->getJson('/api/dashboard/product-ranking');

        $response->assertOk();
        $names = collect($response->json())->pluck('name');

        $this->assertFalse($names->contains('Producto B'), 'El ranking de Tenant A no debe incluir productos de Tenant B.');
    }

    public function test_admin_de_tenant_a_no_puede_listar_usuarios_de_tenant_b_via_endpoint(): void
    {
        // Regresion cubierta: User.php perdio temporalmente BelongsToTenant en el PR de roles
        // (admin/operador/auditoria), lo que habria expuesto GET /users de forma cross-tenant.
        $this->actingAsTenant($this->adminA);

        $response = $this->getJson('/api/users');

        $response->assertOk();
        $emails = collect($response->json())->pluck('email');

        $this->assertTrue($emails->contains('admin-a@test.local'), 'Tenant A debe ver su propio usuario admin.');
        $this->assertFalse($emails->contains('admin-b@test.local'), 'Tenant A NO debe ver el usuario admin de Tenant B.');
        $this->assertSame(1, User::count(), 'El conteo de usuarios visible para Tenant A debe excluir a Tenant B.');
    }

    public function test_admin_de_tenant_a_no_puede_leer_ni_editar_usuario_de_tenant_b_por_id(): void
    {
        $this->actingAsTenant($this->adminA);

        // IDOR: intentar leer/editar un usuario de otro tenant por su ID debe fallar (404),
        // no devolver 403 con datos filtrados ni permitir la edicion.
        $show = $this->getJson("/api/users/{$this->adminB->id}");
        $show->assertNotFound();

        $update = $this->putJson("/api/users/{$this->adminB->id}", ['name' => 'Nombre Hackeado']);
        $update->assertNotFound();

        $this->assertSame('Admin B', $this->adminB->fresh()->name, 'El usuario de Tenant B no debe haber sido modificado.');
    }
}
