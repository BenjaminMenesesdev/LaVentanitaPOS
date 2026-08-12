<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class PosController extends Controller
{
    public function createSale(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sucursal_id' => 'sometimes|integer|exists:sucursales,id',
            'user_id' => 'sometimes|integer|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'sometimes|integer',
            'items.*.sku' => 'sometimes|string',
            'items.*.name' => 'sometimes|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|in:CASH,CARD,TRANSFER',
            'payments.*.amount' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $sucursalId = $user?->sucursal_id ?? $request->input('sucursal_id') ?? env('DEFAULT_SUCURSAL_ID', 1);
        $userId = $user?->id ?? $request->input('user_id') ?? env('DEFAULT_USER_ID', 1);

        $itemsWithPrices = [];
        $productIds = collect($request->items)
            ->map(fn($item) => isset($item['product_id']) ? (int) $item['product_id'] : null)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $productsById = collect();
        if (!empty($productIds)) {
            $productsResponse = Http::get(env('PRODUCTS_SERVICE_URL') . '/products/batch', [
                'ids' => implode(',', $productIds),
            ]);
            $products = $productsResponse->json();
            $productsById = collect($products)->keyBy('id');
        }

        foreach ($request->items as $item) {
            $product = null;
            if (!empty($item['product_id'])) {
                $product = $productsById->get((int) $item['product_id']);
            }

            if (!$product && !empty($item['sku'])) {
                $searchResponse = Http::get(env('PRODUCTS_SERVICE_URL') . '/products', [
                    'search' => $item['sku'],
                ]);
                $searchResult = $searchResponse->json();
                $results = collect($searchResult['data'] ?? $searchResult);
                $product = $results->firstWhere('sku', $item['sku']) ?? $results->firstWhere('name', $item['sku']) ?? $results->first();
            }

            if (!$product && !empty($item['name'])) {
                $searchResponse = Http::get(env('PRODUCTS_SERVICE_URL') . '/products', [
                    'search' => $item['name'],
                ]);
                $searchResult = $searchResponse->json();
                $results = collect($searchResult['data'] ?? $searchResult);
                $product = $results->firstWhere('name', $item['name']) ?? $results->first();
            }

            if (!$product) {
                return response()->json(['error' => 'Producto no encontrado'], 404);
            }

            $itemsWithPrices[] = [
                'product_id' => $product['id'],
                'quantity' => $item['quantity'],
                'price' => $product['price'] ?? ($item['price'] ?? 0),
            ];
        }

        // Llamar a Sales Service
        $saleData = [
            'sucursal_id' => $sucursalId,
            'user_id' => $userId,
            'items' => $itemsWithPrices,
            'payments' => $request->payments,
        ];

        $response = Http::post(env('SALES_SERVICE_URL') . '/sales', $saleData);
        return $response->json();
    }

    public function dashboardSummary(Request $request)
    {
        $sucursalId = $request->user()?->sucursal_id ?? $request->input('sucursal_id') ?? env('DEFAULT_SUCURSAL_ID', 1);

        $response = Http::get(env('SALES_SERVICE_URL') . '/dashboard/summary', [
            'sucursal_id' => $sucursalId,
        ]);
        return $response->json();
    }

    public function products(Request $request)
    {
        $response = Http::get(env('PRODUCTS_SERVICE_URL') . '/products', $request->all());
        return $response->json();
    }

    public function inventoryAlerts(Request $request)
    {
        $response = Http::get(env('INVENTORY_SERVICE_URL') . '/alerts');
        return $response->json();
    }
}