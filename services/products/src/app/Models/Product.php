<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sku', 'name', 'description', 'category_id', 'price', 'cost',
        'stock_min', 'unit', 'active'
    ];
}