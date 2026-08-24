<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Separada de 2024_01_01_000010_create_stock_movements_table.php porque referencia la tabla
// "sales", creada recien en 2024_01_01_000011_create_sales_table.php. Postgres valida la tabla
// referenciada al momento de crear la constraint (a diferencia de SQLite, que no la valida hasta
// el primer insert), por lo que definir esta FK inline en la migracion 000010 rompia
// "migrate:fresh" contra Postgres con "relation \"sales\" does not exist".
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('sale_id')->nullable()->after('user_id')
                ->constrained('sales')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sale_id');
        });
    }
};
