<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_closures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->date('shift_date');
            $table->decimal('expected_cash', 12, 2);
            $table->decimal('counted_cash', 12, 2);
            $table->decimal('difference', 12, 2);
            $table->string('justification', 255)->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'shift_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_closures');
    }
};
