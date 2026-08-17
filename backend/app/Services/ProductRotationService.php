<?php

namespace App\Services;

use App\Models\Product;
use Carbon\Carbon;

class ProductRotationService
{
    public function findStaleProducts(int $days = 30): array
    {
        $cutoff = Carbon::now()->subDays($days);

        return Product::where('is_active', true)
            ->whereDoesntHave('saleItems', function ($query) use ($cutoff) {
                $query->where('created_at', '>=', $cutoff);
            })
            ->get()
            ->map(fn ($product) => [
                'product_id' => $product->id,
                'name' => $product->name,
                'sale_price' => $product->sale_price,
                'last_sale_date' => $product->lastSaleDate(),
                'days_without_sale' => $product->lastSaleDate()
                    ? Carbon::parse($product->lastSaleDate())->diffInDays(now())
                    : null,
            ])
            ->values()
            ->all();
    }
}
