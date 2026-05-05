<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cbt_tests', function (Blueprint $table) {
            $table->renameColumn('subject', 'course');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cbt_tests', function (Blueprint $table) {
            $table->renameColumn('course', 'subject');
        });
    }
};
