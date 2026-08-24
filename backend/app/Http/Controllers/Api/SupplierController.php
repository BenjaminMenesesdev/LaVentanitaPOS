<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Services\AuditService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json(Supplier::with('ingredients')->orderBy('name')->get());
    }

    public function show(Supplier $supplier)
    {
        return response()->json($supplier->load('ingredients'));
    }

    public function store(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores gestionan proveedores.'], 403);
        }

        $validated = $this->validated($request);

        $supplier = Supplier::create($validated);
        AuditService::log('supplier.create', 'Supplier', $supplier->id);

        return response()->json($supplier, 201);
    }

    public function update(Request $request, Supplier $supplier)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores gestionan proveedores.'], 403);
        }

        $validated = $this->validated($request);

        $supplier->update($validated);
        AuditService::log('supplier.update', 'Supplier', $supplier->id);

        return response()->json($supplier);
    }

    /**
     * Elimina un proveedor. Bloqueado por la BD (restrictOnDelete en purchase_orders) si el
     * proveedor tiene ordenes de compra asociadas - se captura y se devuelve un mensaje claro
     * en vez de un error 500 crudo.
     */
    public function destroy(Request $request, Supplier $supplier)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores gestionan proveedores.'], 403);
        }

        try {
            $supplier->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: el proveedor tiene órdenes de compra o ingredientes asociados.',
            ], 409);
        }

        AuditService::log('supplier.delete', 'Supplier', $supplier->id);

        return response()->json(['message' => 'Proveedor eliminado.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'contact_name' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'avg_lead_time_days' => ['required', 'integer', 'min:0'],
            'no_delivery_days' => ['nullable', 'array'],
            'no_delivery_days.*' => ['integer', 'min:0', 'max:6'],
            'min_order_amount' => ['required', 'numeric', 'min:0'],
        ]);
    }
}
