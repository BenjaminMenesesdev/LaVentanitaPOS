<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::apiResource('products', ProductController::class);
Route::get('products/batch', [ProductController::class, 'batch']);