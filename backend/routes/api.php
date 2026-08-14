<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseSuggestionController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\ShiftClosureController;
use App\Http\Controllers\Api\SupplierController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/today', [DashboardController::class, 'today']);
    Route::get('/dashboard/product-ranking', [DashboardController::class, 'productRanking'])->middleware('role:admin');

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'findByBarcode']);
    Route::post('/products', [ProductController::class, 'store'])->middleware('role:admin');
    Route::put('/products/{product}', [ProductController::class, 'update'])->middleware('role:admin');

    Route::get('/products/{product}/recipe', [RecipeController::class, 'show']);
    Route::post('/products/{product}/recipe', [RecipeController::class, 'store'])->middleware('role:admin');

    Route::get('/stock', [InventoryController::class, 'index']);
    Route::get('/stock/alerts', [InventoryController::class, 'alerts']);
    Route::post('/stock/adjust', [InventoryController::class, 'adjust']);
    Route::post('/units/convert', [InventoryController::class, 'convertUnits']);

    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::post('/sales/{sale}/void', [SaleController::class, 'void'])->middleware('role:admin');

    Route::post('/shift-closures', [ShiftClosureController::class, 'store']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::get('/purchase-suggestions', [PurchaseSuggestionController::class, 'index']);
        Route::post('/register', [AuthController::class, 'register']);
    });
});
