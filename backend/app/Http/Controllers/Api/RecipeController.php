<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecipeRequest;
use App\Models\Product;
use App\Models\RecipeItem;
use App\Services\AuditService;
use App\Services\UnitConversionService;
use Illuminate\Support\Facades\DB;

class RecipeController extends Controller
{
    public function __construct(private UnitConversionService $unitConversion)
    {
    }

    public function show(Product $product)
    {
        return response()->json($product->load('recipeItems.ingredient'));
    }

    public function store(StoreRecipeRequest $request, Product $product)
    {
        DB::transaction(function () use ($product, $request) {
            $product->recipeItems()->delete();

            foreach ($request->items as $item) {
                $converted = $this->unitConversion->toBaseUnit($item['unit'], $item['quantity']);

                RecipeItem::create([
                    'product_id' => $product->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity_base_unit' => $converted['quantity_base_unit'],
                ]);
            }
        });

        AuditService::log('recipe.update', 'Product', $product->id);

        return response()->json($product->load('recipeItems.ingredient'));
    }
}
