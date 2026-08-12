<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    protected $fillable = [
        'product_id', 'sucursal_id', 'type', 'quantity',
        'reference_type', 'reference_id', 'user_id'
    ];
}