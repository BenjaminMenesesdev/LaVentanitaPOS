<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Services\AuditService;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json(Supplier::with('ingredients')->get());
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores gestionan proveedores.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'contact_name' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'avg_lead_time_days' => ['required', 'integer', 'min:0'],
            'no_delivery_days' => ['nullable', 'array'],
            'min_order_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $supplier = Supplier::create($validated);
        AuditService::log('supplier.create', 'Supplier', $supplier->id);

        return response()->json($supplier, 201);
    }
}
