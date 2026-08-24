<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InvoiceScan;
use App\Models\Supplier;
use App\Services\AuditService;
use App\Services\InvoiceScanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use RuntimeException;

class InvoiceScanController extends Controller
{
    public function __construct(private InvoiceScanService $invoiceScanService) {}

    public function index()
    {
        return response()->json(InvoiceScan::with('supplier')->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'supplier_id' => ['nullable', 'integer'],
        ]);

        if (! empty($validated['supplier_id']) && ! Supplier::where('id', $validated['supplier_id'])->exists()) {
            return response()->json(['message' => 'El proveedor indicado no existe o no pertenece a este negocio.'], 422);
        }

        $path = $request->file('file')->store('invoices', 'private');
        $tenantId = App::make('currentTenantId');

        $scan = $this->invoiceScanService->upload($tenantId, $request->user()->id, $path, $validated['supplier_id'] ?? null);

        AuditService::log('invoice_scan.upload', 'InvoiceScan', $scan->id);

        return response()->json($scan, 201);
    }

    public function applyExtractedData(Request $request, InvoiceScan $scan)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredient_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $ingredientIds = collect($validated['items'])->pluck('ingredient_id')->unique();
        $validIds = Ingredient::whereIn('id', $ingredientIds)->pluck('id');

        if ($validIds->count() !== $ingredientIds->count()) {
            return response()->json(['message' => 'Uno o más insumos indicados no existen o no pertenecen a este negocio.'], 422);
        }

        try {
            $scan = $this->invoiceScanService->applyExtractedData($scan, $validated['items'], $request->user()->id);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        AuditService::log('invoice_scan.apply', 'InvoiceScan', $scan->id);

        return response()->json($scan);
    }
}
