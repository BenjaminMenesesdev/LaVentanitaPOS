<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SaleService
{
    private const COMMISSION_RATES = [
        'efectivo' => 0.0,
        'debito' => 0.015,
        'credito' => 0.032,
    ];

    public function __construct(private InventoryService $inventoryService)
    {
    }

    public function registerSale(array $items, string $paymentMethod, int $userId): Sale
    {
        return DB::transaction(function () use ($items, $paymentMethod, $userId) {
            $gross = 0;
            $costTotal = 0;
            $recipeRequirements = [];
            $productsCache = [];

            foreach ($items as $item) {
                $product = $productsCache[$item['product_id']]
                    ??= Product::with('recipeItems.ingredient')->findOrFail($item['product_id']);

                $lineGross = $product->sale_price * $item['quantity'];
                $gross += $lineGross;

                $unitCost = $product->currentRecipeCost();
                $costTotal += $unitCost * $item['quantity'];

                if ($product->is_composite) {
                    foreach ($product->recipeItems as $recipeItem) {
                        $key = $recipeItem->ingredient_id;
                        $needed = $recipeItem->quantity_base_unit * $item['quantity'];
                        $recipeRequirements[$key] = ($recipeRequirements[$key] ?? 0) + $needed;
                    }
                }
            }

            $commission = round($gross * self::COMMISSION_RATES[$paymentMethod], 2);
            $net = $gross - $commission;

            $sale = Sale::create([
                'user_id' => $userId,
                'gross_total' => $gross,
                'commission_amount' => $commission,
                'net_total' => $net,
                'cost_total' => $costTotal,
                'payment_method' => $paymentMethod,
                'status' => 'completada',
            ]);

            foreach ($items as $item) {
                $product = $productsCache[$item['product_id']];
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->sale_price,
                    'unit_cost' => $product->currentRecipeCost(),
                ]);
            }

            $requirementsPayload = collect($recipeRequirements)
                ->map(fn ($qty, $ingredientId) => ['ingredient_id' => $ingredientId, 'quantity_base_unit' => $qty])
                ->values()
                ->all();

            if (!empty($requirementsPayload)) {
                $this->inventoryService->deductForSale($requirementsPayload, $userId, $sale->id);
            }

            return $sale->fresh('items');
        });
    }

    public function voidSale(int $saleId, int $voidedBy, string $reason): Sale
    {
        return DB::transaction(function () use ($saleId, $voidedBy, $reason) {
            $sale = Sale::lockForUpdate()->findOrFail($saleId);
            if ($sale->status === 'anulada') {
                throw new RuntimeException('La venta ya se encuentra anulada.');
            }

            $this->inventoryService->restoreForVoidedSale($saleId, $voidedBy);

            $sale->update([
                'status' => 'anulada',
                'voided_by' => $voidedBy,
                'void_reason' => $reason,
            ]);

            return $sale->fresh();
        });
    }
}
