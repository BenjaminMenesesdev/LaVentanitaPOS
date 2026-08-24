<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CloseShiftRequest;
use App\Services\AuditService;
use App\Services\ShiftClosureService;

class ShiftClosureController extends Controller
{
    public function __construct(private ShiftClosureService $shiftClosureService) {}

    public function store(CloseShiftRequest $request)
    {
        $closure = $this->shiftClosureService->close(
            $request->user()->id,
            $request->shift_date,
            $request->cash_counted
        );

        AuditService::log('shift.close', 'ShiftClosure', $closure->id, [
            'difference' => $closure->difference,
        ]);

        return response()->json($closure);
    }
}
