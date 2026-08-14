<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'barcode', 'sku', 'sale_price', 'is_active', 'is_composite'];

    protected $casts = [
        'sale_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_composite' => 'boolean',
    ];

    public function recipeItems()
    {
        return $this->hasMany(RecipeItem::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function currentRecipeCost(): float
    {
        return (float) $this->recipeItems()
            ->with('ingredient')
            ->get()
            ->sum(fn ($item) => $item->quantity_base_unit * $item->ingredient->current_cost_per_base_unit);
    }
}
