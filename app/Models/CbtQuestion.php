<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CbtQuestion extends Model
{
    use HasFactory;

    protected $fillable = ['cbt_test_id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];

    public function test()
    {
        return $this->belongsTo(CbtTest::class, 'cbt_test_id');
    }
}
