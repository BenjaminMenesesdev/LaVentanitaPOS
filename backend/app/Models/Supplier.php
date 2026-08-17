<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'name', 'contact_name', 'phone', 'email',
        'avg_lead_time_days', 'no_delivery_days', 'min_order_amount',
    ];

    protected $casts = [
        'no_delivery_days' => 'array',
        'min_order_amount' => 'decimal:2',
    ];

    public function ingredients()
    {
        return $this->hasMany(Ingredient::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function invoiceScans()
    {
        return $this->hasMany(InvoiceScan::class);
    }
}
