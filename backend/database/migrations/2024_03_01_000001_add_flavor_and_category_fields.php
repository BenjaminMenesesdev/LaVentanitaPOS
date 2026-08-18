<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('category_id', 50)->nullable()->after('sale_price');
            $table->boolean('needs_flavor')->default(false)->after('category_id');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->json('flavors')->nullable()->after('unit_cost');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['category_id', 'needs_flavor']);
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn('flavors');
        });
    }
};
