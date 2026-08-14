<?php

namespace App\Services;

use App\Models\Ingredient;
use Carbon\Carbon;

class PurchaseSuggestionService
{
    public function suggestForIngredient(Ingredient $ingredient, int $windowDays = 7): array
    {
        $currentStock = $ingredient->totalStock();
        $dailyBurnRate = $this->estimateDailyBurnRate($ingredient, $windowDays);
        $daysCovered = $dailyBurnRate > 0 ? $currentStock / $dailyBurnRate : null;

        $suggestedQty = max(0, ($ingredient->min_stock_threshold * 2) - $currentStock);

        return [
            'ingredient_id' => $ingredient->id,
            'ingredient_name' => $ingredient->name,
            'current_stock' => $currentStock,
            'daily_burn_rate' => round($dailyBurnRate, 2),
            'days_covered' => $daysCovered !== null ? round($daysCovered, 1) : null,
            'suggested_purchase_qty_base_unit' => round($suggestedQty, 2),
            'is_critical' => $ingredient->isBelowThreshold(),
        ];
    }

    private function estimateDailyBurnRate(Ingredient $ingredient, int $windowDays): float
    {
        $totalConsumed = (float) $ingredient->stocks()->sum('quantity_base_unit');
        return $totalConsumed > 0 ? $totalConsumed / max($windowDays, 1) : 0;
    }
}
