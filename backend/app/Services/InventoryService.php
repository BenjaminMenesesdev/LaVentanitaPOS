<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryService
{
    private const MAX_BACHAS_CONGELADOR = 28;

    public function adjust(
        int $ingredientId,
        string $location,
        float $quantityDeltaBaseUnit,
        string $reason,
        int $userId,
        ?string $justification = null,
        ?int $saleId = null
    ): Stock {
        return DB::transaction(function () use ($ingredientId, $location, $quantityDeltaBaseUnit, $reason, $userId, $justification, $saleId) {
            $stock = Stock::where('ingredient_id', $ingredientId)
                ->where('location', $location)
                ->lockForUpdate()
                ->first();

            if (!$stock) {
                $stock = Stock::create([
                    'ingredient_id' => $ingredientId,
                    'location' => $location,
                    'quantity_base_unit' => 0,
                ]);
            }

            $newQty = (float) $stock->quantity_base_unit + $quantityDeltaBaseUnit;
            if ($newQty < 0) {
                throw new RuntimeException('Stock insuficiente para completar la operación.');
            }

            if ($location === 'bodega') {
                $ingredient = Ingredient::find($ingredientId);
                if ($ingredient && $ingredient->name === 'Helado') {
                    $bachaEquivalent = $newQty / 18000;
                    if ($bachaEquivalent > self::MAX_BACHAS_CONGELADOR) {
                        throw new RuntimeException('Excede capacidad máxima de congelador (28 bachas).');
                    }
                }
            }

            $stock->update(['quantity_base_unit' => $newQty]);

            StockMovement::create([
                'ingredient_id' => $ingredientId,
                'location' => $location,
                'quantity_delta_base_unit' => $quantityDeltaBaseUnit,
                'reason' => $reason,
                'justification' => $justification,
                'user_id' => $userId,
                'sale_id' => $saleId,
            ]);

            return $stock->fresh();
        });
    }

    public function deductForSale(array $recipeRequirements, int $userId, int $saleId): void
    {
        foreach ($recipeRequirements as $req) {
            $stock = Stock::where('ingredient_id', $req['ingredient_id'])
                ->where('location', 'vitrina')
                ->lockForUpdate()
                ->first();

            if (!$stock || (float) $stock->quantity_base_unit < $req['quantity_base_unit']) {
                throw new RuntimeException("Stock insuficiente para ingrediente ID {$req['ingredient_id']}.");
            }

            $stock->decrement('quantity_base_unit', $req['quantity_base_unit']);

            StockMovement::create([
                'ingredient_id' => $req['ingredient_id'],
                'location' => 'vitrina',
                'quantity_delta_base_unit' => -$req['quantity_base_unit'],
                'reason' => 'venta',
                'user_id' => $userId,
                'sale_id' => $saleId,
            ]);
        }
    }

    public function restoreForVoidedSale(int $saleId, int $userId): void
    {
        $movements = StockMovement::where('sale_id', $saleId)
            ->where('reason', 'venta')
            ->get();

        if ($movements->isEmpty()) {
            return;
        }

        foreach ($movements as $movement) {
            $stock = Stock::where('ingredient_id', $movement->ingredient_id)
                ->where('location', $movement->location)
                ->lockForUpdate()
                ->first();

            $quantityToRestore = abs((float) $movement->quantity_delta_base_unit);

            if (!$stock) {
                $stock = Stock::create([
                    'ingredient_id' => $movement->ingredient_id,
                    'location' => $movement->location,
                    'quantity_base_unit' => 0,
                ]);
            }

            $stock->increment('quantity_base_unit', $quantityToRestore);

            StockMovement::create([
                'ingredient_id' => $movement->ingredient_id,
                'location' => $movement->location,
                'quantity_delta_base_unit' => $quantityToRestore,
                'reason' => 'ajuste_manual',
                'justification' => "Reversion automatica por anulacion de venta #{$saleId}",
                'user_id' => $userId,
                'sale_id' => $saleId,
            ]);
        }
    }

    public function criticalStockAlerts()
    {
        return Ingredient::all()->filter(fn ($ingredient) => $ingredient->isBelowThreshold())->values();
    }

    public function expiringSoonAlerts(int $days = 3)
    {
        return Stock::expiringSoon($days)->with('ingredient')->get();
    }
}
