<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Models\Sale;
use App\Services\AuditService;
use App\Services\SaleService;
use Illuminate\Http\Request;
use RuntimeException;

class SaleController extends Controller
{
    public function __construct(private SaleService $saleService) {}

    public function index(Request $request)
    {
        $query = Sale::with('items.product')->latest();

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        return response()->json($query->paginate(50));
    }

    public function store(StoreSaleRequest $request)
    {
        try {
            $sale = $this->saleService->registerSale(
                $request->items,
                $request->resolvedPaymentMethod(),
                $request->user()->id
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        AuditService::log('sale.create', 'Sale', $sale->id, ['gross_total' => $sale->gross_total]);

        return response()->json($sale, 201);
    }

    public function void(Request $request, Sale $sale)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores pueden anular ventas.'], 403);
        }

        $request->validate(['reason' => ['required', 'string', 'max:255']]);

        try {
            $sale = $this->saleService->voidSale($sale->id, $request->user()->id, $request->reason);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        AuditService::log('sale.void', 'Sale', $sale->id, ['reason' => $request->reason]);

        return response()->json($sale);
    }
}
