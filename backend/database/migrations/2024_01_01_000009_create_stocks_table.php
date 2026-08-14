<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->enum('location', ['bodega', 'vitrina']);
            $table->decimal('quantity_base_unit', 14, 4)->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->unique(['ingredient_id', 'location', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
