<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventoryController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::middleware('api.key')->group(function () {
    Route::post('deduct-batch', [InventoryController::class, 'deductBatch']);
});

Route::get('stock', [InventoryController::class, 'getStock']);
Route::get('alerts', [InventoryController::class, 'alerts']);