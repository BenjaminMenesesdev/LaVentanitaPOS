<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = ['sale_id', 'product_id', 'quantity', 'unit_price', 'unit_cost', 'flavors'];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'unit_cost' => 'decimal:4',
        'flavors' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
