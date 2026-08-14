<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\ShiftClosure;

class ShiftClosureService
{
    public function close(int $userId, string $shiftDate, float $cashCounted): ShiftClosure
    {
        $expected = (float) Sale::where('payment_method', 'efectivo')
            ->where('status', 'completada')
            ->whereDate('created_at', $shiftDate)
            ->sum('net_total');

        $diff = round($cashCounted - $expected, 2);

        return ShiftClosure::updateOrCreate(
            ['user_id' => $userId, 'shift_date' => $shiftDate],
            [
                'expected_cash' => $expected,
                'counted_cash' => $cashCounted,
                'difference' => $diff,
                'justification' => abs($diff) > 0.01 ? null : 'Cuadre exacto',
            ]
        );
    }
}
