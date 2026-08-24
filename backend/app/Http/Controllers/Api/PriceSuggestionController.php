<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceSuggestion;
use App\Services\AuditService;
use App\Services\PriceSuggestionService;
use Illuminate\Support\Facades\App;

class PriceSuggestionController extends Controller
{
    public function __construct(private PriceSuggestionService $priceSuggestionService) {}

    public function index()
    {
        return response()->json(PriceSuggestion::with('product')->where('status', 'pendiente')->get());
    }

    public function generate()
    {
        $tenantId = App::make('currentTenantId');
        $suggestions = $this->priceSuggestionService->generateForTenant($tenantId);

        AuditService::log('price_suggestion.generate', 'Tenant', $tenantId, ['count' => count($suggestions)]);

        return response()->json($suggestions, 201);
    }

    public function apply(PriceSuggestion $suggestion)
    {
        $suggestion = $this->priceSuggestionService->apply($suggestion);
        AuditService::log('price_suggestion.apply', 'PriceSuggestion', $suggestion->id);

        return response()->json($suggestion);
    }

    public function discard(PriceSuggestion $suggestion)
    {
        $suggestion = $this->priceSuggestionService->discard($suggestion);
        AuditService::log('price_suggestion.discard', 'PriceSuggestion', $suggestion->id);

        return response()->json($suggestion);
    }
}
