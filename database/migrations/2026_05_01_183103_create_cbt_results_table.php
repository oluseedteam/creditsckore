<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cbt_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cbt_test_id')->constrained('cbt_tests')->onDelete('cascade');
            $table->unsignedBigInteger('user_id'); // Just an integer for now, no foreign key if user table is different
            $table->integer('score');
            $table->integer('total_questions');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cbt_results');
    }
};
