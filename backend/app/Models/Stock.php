<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'ingredient_id', 'location', 'quantity_base_unit', 'expires_at'];

    protected $casts = [
        'quantity_base_unit' => 'decimal:4',
        'expires_at' => 'datetime',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function scopeExpiringSoon($query, int $days = 3)
    {
        return $query->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now(), now()->addDays($days)]);
    }
}
