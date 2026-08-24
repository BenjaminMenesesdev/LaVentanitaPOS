<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->restrictOnDelete();
            $table->enum('location', ['bodega', 'vitrina']);
            $table->decimal('quantity_delta_base_unit', 14, 4);
            $table->enum('reason', [
                'venta', 'merma', 'vencimiento', 'derretimiento',
                'rotura', 'consumo_personal', 'recepcion', 'traslado', 'ajuste_manual',
            ]);
            $table->string('justification', 255)->nullable();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            // sale_id se agrega en 2024_01_01_000011_add_sale_id_to_stock_movements_table.php:
            // la tabla "sales" todavia no existe en este punto de la migracion (se crea despues),
            // y Postgres (a diferencia de SQLite) valida la tabla referenciada al momento del
            // CREATE TABLE / ADD CONSTRAINT, no solo al insertar filas.
            $table->timestamps();
            $table->index(['ingredient_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
