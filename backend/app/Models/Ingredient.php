<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'name', 'base_unit', 'supplier_id',
        'current_cost_per_base_unit', 'min_stock_threshold', 'shelf_life_days',
    ];

    protected $casts = [
        'current_cost_per_base_unit' => 'decimal:6',
        'min_stock_threshold' => 'decimal:4',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function priceHistory()
    {
        return $this->hasMany(IngredientPriceHistory::class);
    }

    public function totalStock(string $location = null): float
    {
        $query = $this->stocks();
        if ($location) {
            $query->where('location', $location);
        }
        return (float) $query->sum('quantity_base_unit');
    }

    public function isBelowThreshold(): bool
    {
        return $this->totalStock() <= $this->min_stock_threshold;
    }
}
