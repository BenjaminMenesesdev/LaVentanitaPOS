<?php

namespace App\Models;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements JWTSubject
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'sucursal_id', 'active'
    ];

    protected $hidden = ['password', 'remember_token'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'sucursal_id' => $this->sucursal_id,
            'role' => $this->role, // Asumiendo que tienes columna role
        ];
    }
}<?php

namespace App\Models;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements JWTSubject
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'sucursal_id', 'active'
    ];

    protected $hidden = ['password', 'remember_token'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'sucursal_id' => $this->sucursal_id,
            'role' => $this->role, // Asumiendo que tienes columna role
        ];
    }
}