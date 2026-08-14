<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitConversion extends Model
{
    protected $fillable = ['unit_name', 'base_unit', 'factor_to_base'];

    protected $casts = ['factor_to_base' => 'decimal:4'];
}
