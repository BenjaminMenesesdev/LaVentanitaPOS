<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\InvoiceScanController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\PriceSuggestionController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductRotationController;
use App\Http\Controllers\Api\PurchaseSuggestionController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\ShiftClosureController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/plans', [PlanController::class, 'index']);
Route::post('/tenants/register', [TenantController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('throttle:20,1');

Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/tenant/current', [TenantController::class, 'current']);

    // Dashboard: lectura para admin y auditoria. El operador no tiene acceso (ver roles.js del frontend).
    Route::middleware('role:admin,auditoria')->group(function () {
        Route::get('/dashboard/today', [DashboardController::class, 'today']);
        Route::get('/dashboard', [DashboardController::class, 'today']);
    });
    Route::get('/dashboard/product-ranking', [DashboardController::class, 'productRanking'])->middleware('role:admin');

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'findByBarcode']);
    Route::post('/products', [ProductController::class, 'store'])->middleware(['role:admin', 'plan.limit:products']);
    Route::put('/products/{product}', [ProductController::class, 'update'])->middleware('role:admin');

    Route::get('/products/{product}/recipe', [RecipeController::class, 'show']);
    Route::post('/products/{product}/recipe', [RecipeController::class, 'store'])->middleware('role:admin');

    // Inventario: lectura abierta a todos los autenticados (admin/operador/auditoria).
    Route::get('/stock', [InventoryController::class, 'index']);
    Route::get('/stock/alerts', [InventoryController::class, 'alerts']);
    Route::get('/inventory/alerts', [InventoryController::class, 'alerts']);

    // Ajustes de stock (compra/traslado/merma): admin y operador.
    // InventoryController::adjust debe seguir validando internamente que el operador
    // solo pueda enviar type=purchase (traslado/merma quedan reservados a admin).
    Route::post('/stock/adjust', [InventoryController::class, 'adjust'])->middleware('role:admin,operador');
    Route::post('/units/convert', [InventoryController::class, 'convertUnits']);

    // Aviso de stock bajo a administracion (correo/WhatsApp) - operador y admin.
    Route::post('/inventory/{stock}/notify-low-stock', [InventoryController::class, 'notifyLowStock'])
        ->middleware('role:admin,operador');

    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store'])->middleware('role:admin,operador');
    Route::post('/sales/{sale}/void', [SaleController::class, 'void'])->middleware('role:admin');

    Route::post('/shift-closures', [ShiftClosureController::class, 'store']);

    // Usuarios: CRUD exclusivo de Administracion.
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::get('/purchase-suggestions', [PurchaseSuggestionController::class, 'index']);
        Route::post('/register', [AuthController::class, 'register'])->middleware('plan.limit:users');
    });

    Route::middleware(['role:admin', 'plan.feature:invoice_scan'])->group(function () {
        Route::get('/invoice-scans', [InvoiceScanController::class, 'index']);
        Route::post('/invoice-scans', [InvoiceScanController::class, 'store']);
        Route::post('/invoice-scans/{scan}/apply', [InvoiceScanController::class, 'applyExtractedData']);
    });

    Route::middleware(['role:admin', 'plan.feature:ai_suggestions'])->group(function () {
        Route::get('/price-suggestions', [PriceSuggestionController::class, 'index']);
        Route::post('/price-suggestions/generate', [PriceSuggestionController::class, 'generate']);
        Route::post('/price-suggestions/{suggestion}/apply', [PriceSuggestionController::class, 'apply']);
        Route::post('/price-suggestions/{suggestion}/discard', [PriceSuggestionController::class, 'discard']);
        Route::get('/products/stale', [ProductRotationController::class, 'staleProducts']);
    });
});
