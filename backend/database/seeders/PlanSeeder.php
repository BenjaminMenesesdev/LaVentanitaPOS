<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::updateOrCreate(['code' => 'esencial'], [
            'name' => 'Plan Esencial',
            'price_monthly' => 12000,
            'price_yearly' => 144000,
            'max_products' => 3500,
            'max_users' => 2,
            'max_catalogs' => 0,
            'features' => [
                'barcode_pos' => true,
                'stock_management' => true,
                'sales_reports' => true,
                'customer_accounts' => true,
                'arca_billing' => true,
                'catalog_online' => false,
                'ai_suggestions' => false,
                'invoice_scan' => false,
                'scale_support' => false,
            ],
            'is_active' => true,
        ]);

        Plan::updateOrCreate(['code' => 'pro'], [
            'name' => 'Plan Pro',
            'price_monthly' => 20000,
            'price_yearly' => 240000,
            'max_products' => 10000,
            'max_users' => 5,
            'max_catalogs' => 1,
            'features' => [
                'barcode_pos' => true,
                'stock_management' => true,
                'sales_reports' => true,
                'customer_accounts' => true,
                'arca_billing' => true,
                'catalog_online' => true,
                'ai_suggestions' => false,
                'invoice_scan' => false,
                'scale_support' => true,
            ],
            'is_active' => true,
        ]);

        Plan::updateOrCreate(['code' => 'ia'], [
            'name' => 'Plan IA',
            'price_monthly' => 22800,
            'price_yearly' => 273600,
            'max_products' => 15000,
            'max_users' => 7,
            'max_catalogs' => 2,
            'features' => [
                'barcode_pos' => true,
                'stock_management' => true,
                'sales_reports' => true,
                'customer_accounts' => true,
                'arca_billing' => true,
                'catalog_online' => true,
                'ai_suggestions' => true,
                'invoice_scan' => true,
                'scale_support' => true,
            ],
            'is_active' => true,
        ]);
    }
}
