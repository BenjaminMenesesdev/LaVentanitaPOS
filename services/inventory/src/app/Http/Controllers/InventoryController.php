<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    public function deductBatch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'sucursal_id' => 'required|exists:sucursales,id',
            'reference_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                $inventory = Inventory::where('product_id', $item['product_id'])
                                      ->where('sucursal_id', $request->sucursal_id)
                                      ->first();
                if (!$inventory || $inventory->quantity < $item['quantity']) {
                    return response()->json(['error' => "Stock insuficiente para producto {$item['product_id']}"], 409);
                }
                $inventory->quantity -= $item['quantity'];
                $inventory->save();

                InventoryMovement::create([
                    'product_id' => $item['product_id'],
                    'sucursal_id' => $request->sucursal_id,
                    'type' => 'SALIDA',
                    'quantity' => -$item['quantity'],
                    'reference_type' => 'sale',
                    'reference_id' => $request->reference_id,
                    'user_id' => auth()->id() ?? 1,
                ]);
            }
            return response()->json(['message' => 'Stock deducted']);
        });
    }

    public function getStock(Request $request)
    {
        $inventory = Inventory::where('product_id', $request->product_id)
                              ->where('sucursal_id', $request->sucursal_id)
                              ->first();
        return response()->json($inventory);
    }

    public function alerts(Request $request)
    {
        // Retorna productos con stock menor al mínimo (asumiendo que products service tiene stock_min)
        // Aquí solo devolvemos inventario bajo 0
        $alerts = Inventory::where('quantity', '<', 5)->get();
        return response()->json($alerts);
    }
}