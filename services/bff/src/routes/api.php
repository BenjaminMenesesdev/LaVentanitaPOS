<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PosController;
use App\Http\Controllers\AuthProxyController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('login', [AuthProxyController::class, 'login']);
Route::post('refresh', [AuthProxyController::class, 'refresh']);

Route::post('sales', [PosController::class, 'createSale']);
Route::get('dashboard', [PosController::class, 'dashboardSummary']);
Route::get('products', [PosController::class, 'products']);
Route::get('inventory/alerts', [PosController::class, 'inventoryAlerts']);
Route::post('logout', [AuthProxyController::class, 'logout']);