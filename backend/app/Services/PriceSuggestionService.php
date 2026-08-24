<?php

namespace App\Services;

use App\Models\PriceSuggestion;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class PriceSuggestionService
{
    private const TARGET_MARGIN = 0.35;

    public function generateForTenant(int $tenantId): array
    {
        $products = Product::where('is_active', true)->where('is_composite', true)->get();
        $suggestions = [];

        foreach ($products as $product) {
            $cost = $product->currentRecipeCost();
            if ($cost <= 0) {
                continue;
            }

            $suggestedPrice = round($cost / (1 - self::TARGET_MARGIN), -2);
            $currentPrice = (float) $product->sale_price;
            $diffPct = $currentPrice > 0 ? (($suggestedPrice - $currentPrice) / $currentPrice) : 0;

            if (abs($diffPct) < 0.05) {
                continue;
            }

            $reason = $diffPct > 0
                ? 'El costo de insumos subio y el margen actual esta por debajo del objetivo (35%).'
                : 'El precio actual supera el margen objetivo; se podria ajustar para ser mas competitivo.';

            $suggestion = PriceSuggestion::create([
                'tenant_id' => $tenantId,
                'product_id' => $product->id,
                'current_price' => $currentPrice,
                'suggested_price' => $suggestedPrice,
                'estimated_margin_impact' => round($suggestedPrice - $currentPrice, 2),
                'reason' => $reason,
                'status' => 'pendiente',
            ]);

            $suggestions[] = $suggestion;
        }

        return $suggestions;
    }

    public function apply(PriceSuggestion $suggestion): PriceSuggestion
    {
        return DB::transaction(function () use ($suggestion) {
            $suggestion->product->update(['sale_price' => $suggestion->suggested_price]);
            $suggestion->update(['status' => 'aplicada']);

            return $suggestion->fresh();
        });
    }

    public function discard(PriceSuggestion $suggestion): PriceSuggestion
    {
        $suggestion->update(['status' => 'descartada']);

        return $suggestion->fresh();
    }
}
