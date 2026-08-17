<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use BelongsToTenant, HasFactory, SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'barcode', 'sku', 'sale_price', 'is_active', 'is_composite'];

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

    public function priceSuggestions()
    {
        return $this->hasMany(PriceSuggestion::class);
    }

    public function currentRecipeCost(): float
    {
        return (float) $this->recipeItems()
            ->with('ingredient')
            ->get()
            ->sum(fn ($item) => $item->quantity_base_unit * $item->ingredient->current_cost_per_base_unit);
    }

    public function lastSaleDate(): ?string
    {
        $lastItem = $this->saleItems()->latest('created_at')->first();
        return $lastItem?->created_at?->toDateString();
    }
}
