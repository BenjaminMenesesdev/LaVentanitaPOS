<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('current_price', 12, 2);
            $table->decimal('suggested_price', 12, 2);
            $table->decimal('estimated_margin_impact', 12, 2)->nullable();
            $table->string('reason', 255)->nullable();
            $table->enum('status', ['pendiente', 'aplicada', 'descartada'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_suggestions');
    }
};
