<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class ShiftClosure extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'user_id', 'shift_date', 'expected_cash', 'counted_cash', 'difference', 'justification'];

    protected $casts = [
        'shift_date' => 'date',
        'expected_cash' => 'decimal:2',
        'counted_cash' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
