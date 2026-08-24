<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use BelongsToTenant, HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Defaults en memoria alineados con el default de BD (migracion
     * create_users_table). Sin esto, User::create() sin 'is_active' explicito
     * deja el atributo en null en el objeto recien creado (Eloquent no relee
     * los defaults de columna tras el INSERT), lo que hacia fallar
     * EnsureUserHasRole::handle() -> !$user->is_active en el mismo
     * ciclo de request/objeto (p.ej. en tests con actingAs()).
     */
    protected $attributes = [
        'is_active' => true,
    ];

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    public const ROLES = ['admin', 'operador', 'auditoria', 'super_admin'];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isOperador(): bool
    {
        return $this->role === 'operador';
    }

    public function isAuditoria(): bool
    {
        return $this->role === 'auditoria';
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
