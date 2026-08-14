<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'ingredient_id', 'location', 'quantity_delta_base_unit',
        'reason', 'justification', 'user_id', 'sale_id',
    ];

    protected $casts = ['quantity_delta_base_unit' => 'decimal:4'];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
