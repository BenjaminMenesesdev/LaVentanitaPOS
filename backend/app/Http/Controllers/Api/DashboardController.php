<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Services\InventoryService;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct(private InventoryService $inventoryService) {}

    public function today()
    {
        $today = now()->toDateString();

        $sales = Sale::whereDate('created_at', $today)->where('status', 'completada')->get();

        $byPaymentMethod = $sales->groupBy('payment_method')->map(function ($group) {
            return [
                'gross' => $group->sum('gross_total'),
                'commission' => $group->sum('commission_amount'),
                'net' => $group->sum('net_total'),
                'count' => $group->count(),
            ];
        });

        return response()->json([
            'date' => $today,
            'total_gross' => $sales->sum('gross_total'),
            'total_net' => $sales->sum('net_total'),
            'total_commission' => $sales->sum('commission_amount'),
            'net_margin' => $sales->sum('net_total') - $sales->sum('cost_total'),
            'transactions_count' => $sales->count(),
            'by_payment_method' => $byPaymentMethod,
            'alerts' => [
                'critical_stock' => $this->inventoryService->criticalStockAlerts()->count(),
                'expiring_soon' => $this->inventoryService->expiringSoonAlerts()->count(),
            ],
        ]);
    }

    public function productRanking()
    {
        $tenantId = App::make('currentTenantId');

        $ranking = DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->join('products', 'products.id', '=', 'sale_items.product_id')
            ->where('sales.status', 'completada')
            ->where('sales.tenant_id', $tenantId)
            ->where('products.tenant_id', $tenantId)
            ->select('products.name')
            ->selectRaw('SUM(sale_items.quantity) as total_quantity')
            ->selectRaw('SUM(sale_items.quantity * sale_items.unit_price) as total_revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(20)
            ->get();

        return response()->json($ranking);
    }
}
