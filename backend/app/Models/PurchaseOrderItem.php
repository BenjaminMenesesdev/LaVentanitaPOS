<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $fillable = ['purchase_order_id', 'ingredient_id', 'quantity_base_unit', 'unit_cost'];

    protected $casts = [
        'quantity_base_unit' => 'decimal:4',
        'unit_cost' => 'decimal:6',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
