<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cbt_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cbt_test_id')->constrained('cbt_tests')->onDelete('cascade');
            $table->text('text');
            $table->string('option_a');
            $table->string('option_b');
            $table->string('option_c');
            $table->string('option_d');
            $table->string('correct_answer');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cbt_questions');
    }
};
