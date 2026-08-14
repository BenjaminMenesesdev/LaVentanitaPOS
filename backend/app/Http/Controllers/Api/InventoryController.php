<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustStockRequest;
use App\Models\Stock;
use App\Services\AuditService;
use App\Services\InventoryService;
use App\Services\UnitConversionService;
use Illuminate\Http\Request;
use RuntimeException;

class InventoryController extends Controller
{
    public function __construct(
        private InventoryService $inventoryService,
        private UnitConversionService $unitConversion
    ) {
    }

    public function index()
    {
        return response()->json(Stock::with('ingredient')->get());
    }

    public function alerts()
    {
        return response()->json([
            'critical_stock' => $this->inventoryService->criticalStockAlerts(),
            'expiring_soon' => $this->inventoryService->expiringSoonAlerts(),
        ]);
    }

    public function adjust(AdjustStockRequest $request)
    {
        $converted = $this->unitConversion->toBaseUnit($request->unit, abs($request->quantity_delta));
        $signedQty = $request->quantity_delta < 0 ? -$converted['quantity_base_unit'] : $converted['quantity_base_unit'];

        try {
            $stock = $this->inventoryService->adjust(
                $request->ingredient_id,
                $request->location,
                $signedQty,
                $request->reason,
                $request->user()->id,
                $request->justification
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        AuditService::log('stock.adjust', 'Ingredient', $request->ingredient_id, [
            'delta_base_unit' => $signedQty,
            'reason' => $request->reason,
        ]);

        return response()->json($stock);
    }

    public function convertUnits(Request $request)
    {
        $validated = $request->validate([
            'from_unit' => ['required', 'string'],
            'to_unit' => ['required', 'string'],
            'quantity' => ['required', 'numeric', 'min:0'],
        ]);

        $base = $this->unitConversion->toBaseUnit($validated['from_unit'], $validated['quantity']);
        $result = $this->unitConversion->fromBaseUnit($validated['to_unit'], $base['quantity_base_unit']);

        return response()->json([
            'from' => $validated['from_unit'],
            'to' => $validated['to_unit'],
            'input_quantity' => $validated['quantity'],
            'result' => $result,
        ]);
    }
}
