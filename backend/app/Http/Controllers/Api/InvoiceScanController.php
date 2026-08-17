<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvoiceScan;
use App\Services\AuditService;
use App\Services\InvoiceScanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use RuntimeException;

class InvoiceScanController extends Controller
{
    public function __construct(private InvoiceScanService $invoiceScanService)
    {
    }

    public function index()
    {
        return response()->json(InvoiceScan::with('supplier')->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
        ]);

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
            'items.*.ingredient_id' => ['required', 'integer', 'exists:ingredients,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $scan = $this->invoiceScanService->applyExtractedData($scan, $validated['items'], $request->user()->id);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        AuditService::log('invoice_scan.apply', 'InvoiceScan', $scan->id);

        return response()->json($scan);
    }
}
