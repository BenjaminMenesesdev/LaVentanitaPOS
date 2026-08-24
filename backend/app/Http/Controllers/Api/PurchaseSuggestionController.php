<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Services\PurchaseSuggestionService;

class PurchaseSuggestionController extends Controller
{
    public function __construct(private PurchaseSuggestionService $suggestionService) {}

    public function index()
    {
        $suggestions = Ingredient::with('supplier')->get()
            ->map(fn ($ingredient) => $this->suggestionService->suggestForIngredient($ingredient));

        return response()->json($suggestions->values());
    }
}
