<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'gross_total', 'commission_amount', 'net_total', 'cost_total',
        'payment_method', 'status', 'voided_by', 'void_reason',
    ];

    protected $casts = [
        'gross_total' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'net_total' => 'decimal:2',
        'cost_total' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function netMargin(): float
    {
        return (float) ($this->net_total - $this->cost_total);
    }
}
