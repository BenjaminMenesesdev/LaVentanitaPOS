<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->decimal('gross_total', 12, 2);
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('net_total', 12, 2);
            $table->decimal('cost_total', 12, 2)->default(0);
            $table->enum('payment_method', ['efectivo', 'debito', 'credito']);
            $table->enum('status', ['completada', 'anulada'])->default('completada');
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('void_reason', 255)->nullable();
            $table->timestamps();
            $table->index(['created_at', 'payment_method']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
