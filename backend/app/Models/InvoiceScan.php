<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceScan extends Model
{
    protected $fillable = [
        'tenant_id', 'supplier_id', 'uploaded_by', 'file_path',
        'status', 'extracted_data', 'total_amount', 'error_message', 'processed_at',
    ];

    protected $casts = [
        'extracted_data' => 'array',
        'total_amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
