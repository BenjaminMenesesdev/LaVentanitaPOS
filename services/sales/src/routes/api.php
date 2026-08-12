<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SaleController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('sales', [SaleController::class, 'store']);
Route::get('sales', [SaleController::class, 'index']);
Route::get('dashboard/summary', [SaleController::class, 'dashboardSummary']);
Route::post('sales/{id}/cancel', [SaleController::class, 'cancel']);