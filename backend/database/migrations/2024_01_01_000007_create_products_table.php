<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('barcode', 64)->nullable()->unique();
            $table->string('sku', 64)->nullable()->unique();
            $table->decimal('sale_price', 12, 2);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_composite')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index('barcode');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
