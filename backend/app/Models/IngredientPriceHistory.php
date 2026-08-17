<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class IngredientPriceHistory extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'ingredient_id', 'cost_per_base_unit', 'changed_by'];

    protected $casts = [
        'cost_per_base_unit' => 'decimal:6',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
