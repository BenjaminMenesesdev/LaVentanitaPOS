<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\IngredientPriceHistory;
use App\Models\InvoiceScan;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InvoiceScanService
{
    public function upload(int $tenantId, int $userId, string $filePath, ?int $supplierId = null): InvoiceScan
    {
        return InvoiceScan::create([
            'tenant_id' => $tenantId,
            'supplier_id' => $supplierId,
            'uploaded_by' => $userId,
            'file_path' => $filePath,
            'status' => 'pendiente',
        ]);
    }

    public function applyExtractedData(InvoiceScan $scan, array $items, int $userId): InvoiceScan
    {
        if ($scan->status === 'procesada') {
            throw new RuntimeException('Esta factura ya fue procesada.');
        }

        DB::transaction(function () use ($scan, $items, $userId) {
            foreach ($items as $item) {
                $ingredient = Ingredient::find($item['ingredient_id']);
                if (!$ingredient) {
                    continue;
                }

                if ((float) $ingredient->current_cost_per_base_unit !== (float) $item['unit_cost']) {
                    IngredientPriceHistory::create([
                        'ingredient_id' => $ingredient->id,
                        'cost_per_base_unit' => $item['unit_cost'],
                        'changed_by' => $userId,
                    ]);
                    $ingredient->update(['current_cost_per_base_unit' => $item['unit_cost']]);
                }
            }

            $scan->update([
                'status' => 'procesada',
                'extracted_data' => $items,
                'total_amount' => collect($items)->sum(fn ($i) => $i['unit_cost'] * $i['quantity']),
                'processed_at' => now(),
            ]);
        });

        return $scan->fresh();
    }

    public function markAsError(InvoiceScan $scan, string $message): InvoiceScan
    {
        $scan->update(['status' => 'error', 'error_message' => $message]);
        return $scan->fresh();
    }
}
