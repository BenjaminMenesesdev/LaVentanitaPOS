<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class PriceSuggestion extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'product_id', 'current_price', 'suggested_price',
        'estimated_margin_impact', 'reason', 'status',
    ];

    protected $casts = [
        'current_price' => 'decimal:2',
        'suggested_price' => 'decimal:2',
        'estimated_margin_impact' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
