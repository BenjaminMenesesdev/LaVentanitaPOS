<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::where('is_active', true)->paginate(50));
    }

    public function findByBarcode(string $barcode)
    {
        $product = Product::where('barcode', $barcode)->where('is_active', true)->first();

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado para ese código.'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores pueden crear productos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:150'],
            'barcode' => ['nullable', 'string', 'max:64', 'unique:products,barcode'],
            'sku' => ['nullable', 'string', 'max:64', 'unique:products,sku'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'is_composite' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::create($validator->validated());
        AuditService::log('product.create', 'Product', $product->id);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores pueden modificar precios.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:150'],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:64', 'unique:products,barcode,'.$product->id],
            'sale_price' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldPrice = $product->sale_price;
        $product->update($validator->validated());

        AuditService::log('product.update', 'Product', $product->id, [
            'old_price' => $oldPrice,
            'new_price' => $product->sale_price,
        ]);

        return response()->json($product);
    }
}
