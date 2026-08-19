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
    /**
     * Motivos de ajuste que un operador puede registrar. Todo lo que no este en
     * esta lista (traslado bodega->vitrina, mermas, vencimientos, etc.) queda
     * reservado a admin, aunque la ruta ya permita el rol "operador" via middleware.
     */
    private const OPERADOR_ALLOWED_REASONS = ['compra', 'purchase'];

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
        $user = $request->user();

        // Un operador solo puede registrar compras (entradas de stock con reason=compra).
        // Traslados, mermas y cualquier otro motivo quedan reservados a admin.
        if ($user->isOperador()) {
            $isPurchase = in_array($request->reason, self::OPERADOR_ALLOWED_REASONS, true);
            $isInboundQty = $request->quantity_delta > 0;

            if (!$isPurchase || !$isInboundQty) {
                return response()->json([
                    'message' => 'Como operador solo puedes registrar compras (ingreso de stock). Traslados y mermas los gestiona Administración.',
                ], 403);
            }
        }

        $converted = $this->unitConversion->toBaseUnit($request->unit, abs($request->quantity_delta));
        $signedQty = $request->quantity_delta < 0 ? -$converted['quantity_base_unit'] : $converted['quantity_base_unit'];

        try {
            $stock = $this->inventoryService->adjust(
                $request->ingredient_id,
                $request->location,
                $signedQty,
                $request->reason,
                $user->id,
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

    /**
     * Aviso de stock bajo a administración. Por ahora solo registra la intención
     * en AuditService; el envío real de correo/WhatsApp queda pendiente (deuda técnica).
     */
    public function notifyLowStock(Request $request, Stock $stock)
    {
        AuditService::log('stock.notify_low_stock', 'Stock', $stock->id, [
            'requested_by' => $request->user()->id,
            'ingredient_id' => $stock->ingredient_id ?? null,
        ]);

        // TODO: disparar Notification/Mail real a los usuarios con rol admin.
        // Notification::send(User::where('role', 'admin')->get(), new LowStockAlert($stock));

        return response()->json(['message' => 'Administración fue notificada.']);
    }
}
