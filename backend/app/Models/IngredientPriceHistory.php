<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IngredientPriceHistory extends Model
{
    public $timestamps = false;

    protected $fillable = ['ingredient_id', 'cost_per_base_unit', 'changed_by', 'effective_at'];

    protected $casts = [
        'cost_per_base_unit' => 'decimal:6',
        'effective_at' => 'datetime',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
