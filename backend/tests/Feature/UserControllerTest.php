<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $admin;

    private User $operador;

    private User $auditoria;

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
        $this->auditoria = User::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Auditor Uno',
            'email' => 'auditoria@test.local', 'password' => 'password123', 'role' => 'auditoria',
        ]);
    }

    private function actingAsTenant(User $user): void
    {
        $this->actingAs($user);
        App::instance('currentTenantId', $user->tenant_id);
        App::instance('currentTenant', $user->tenant()->first());
    }

    public function test_admin_puede_listar_usuarios(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->getJson('/api/users');

        $response->assertOk();
        $emails = collect($response->json())->pluck('email');
        $this->assertTrue($emails->contains('admin@test.local'));
        $this->assertTrue($emails->contains('operador@test.local'));
        $this->assertTrue($emails->contains('auditoria@test.local'));
        $this->assertCount(3, $response->json());
    }

    public function test_operador_no_puede_listar_usuarios(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->getJson('/api/users');

        $response->assertForbidden();
    }

    public function test_auditoria_no_puede_listar_usuarios(): void
    {
        $this->actingAsTenant($this->auditoria);

        $response = $this->getJson('/api/users');

        $response->assertForbidden();
    }

    public function test_admin_puede_crear_usuario_operador(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->postJson('/api/users', [
            'name' => 'Nuevo Operador',
            'email' => 'nuevo-operador@test.local',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'operador',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', [
            'email' => 'nuevo-operador@test.local',
            'role' => 'operador',
            'tenant_id' => $this->tenant->id,
        ]);
    }

    public function test_admin_no_puede_crear_usuario_con_rol_invalido(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->postJson('/api/users', [
            'name' => 'Rol Invalido',
            'email' => 'rol-invalido@test.local',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'cajero',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', ['email' => 'rol-invalido@test.local']);
    }

    public function test_operador_no_puede_crear_usuarios(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->postJson('/api/users', [
            'name' => 'Intento Operador',
            'email' => 'intento@test.local',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'operador',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_puede_actualizar_rol_de_un_usuario(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->putJson("/api/users/{$this->operador->id}", [
            'role' => 'auditoria',
        ]);

        $response->assertOk();
        $this->assertSame('auditoria', $this->operador->fresh()->role);
    }

    public function test_admin_puede_desactivar_un_usuario_sin_borrar_password(): void
    {
        $this->actingAsTenant($this->admin);
        $originalHash = $this->operador->password;

        $response = $this->putJson("/api/users/{$this->operador->id}", [
            'is_active' => false,
        ]);

        $response->assertOk();
        $this->operador->refresh();
        $this->assertFalse((bool) $this->operador->is_active);
        $this->assertSame($originalHash, $this->operador->password, 'No enviar password no debe alterar el hash existente.');
    }

    public function test_admin_puede_eliminar_a_otro_usuario(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->deleteJson("/api/users/{$this->operador->id}");

        $response->assertOk();
        $this->assertSoftDeleted('users', ['id' => $this->operador->id]);
    }

    public function test_admin_no_puede_eliminarse_a_si_mismo(): void
    {
        $this->actingAsTenant($this->admin);

        $response = $this->deleteJson("/api/users/{$this->admin->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $this->admin->id, 'deleted_at' => null]);
    }

    public function test_operador_no_puede_eliminar_usuarios(): void
    {
        $this->actingAsTenant($this->operador);

        $response = $this->deleteJson("/api/users/{$this->auditoria->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $this->auditoria->id, 'deleted_at' => null]);
    }
}
