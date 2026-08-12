<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sucursal_id' => 'required|exists:sucursales,id',
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|in:CASH,CARD,TRANSFER',
            'payments.*.amount' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $subtotal = collect($request->items)->sum(fn($item) => $item['price'] * $item['quantity']);
            $tax = $subtotal * 0.16;
            $total = $subtotal + $tax;

            $sale = Sale::create([
                'sucursal_id' => $request->sucursal_id,
                'user_id' => $request->user_id,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'status' => 'COMPLETED',
            ]);

            foreach ($request->items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                ]);
            }

            foreach ($request->payments as $payment) {
                Payment::create([
                    'sale_id' => $sale->id,
                    'method' => $payment['method'],
                    'amount' => $payment['amount'],
                ]);
            }

            // Descontar inventario vía Inventory Service
            Http::post(env('INVENTORY_SERVICE_URL') . '/deduct-batch', [
                'items' => $request->items,
                'sucursal_id' => $request->sucursal_id,
                'reference_id' => $sale->id,
            ]);

            return response()->json($sale->load('items', 'payments'), 201);
        });
    }

    public function index(Request $request)
    {
        $sales = Sale::with('items', 'payments')
                     ->where('sucursal_id', $request->user()->sucursal_id)
                     ->paginate(20);
        return response()->json($sales);
    }

    public function dashboardSummary(Request $request)
    {
        $sucursalId = $request->input('sucursal_id');
        $today = now()->toDateString();
        $sales = Sale::where('sucursal_id', $sucursalId)
                     ->whereDate('created_at', $today)
                     ->where('status', 'COMPLETED')
                     ->get();
        $total = $sales->sum('total');
        $count = $sales->count();
        return response()->json(['total' => $total, 'count' => $count]);
    }
}