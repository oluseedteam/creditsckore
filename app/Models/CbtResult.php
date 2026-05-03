<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CbtResult extends Model
{
    use HasFactory;

    protected $fillable = ['cbt_test_id', 'user_id', 'score', 'total_questions', 'answers'];

    protected $casts = [
        'answers' => 'array'
    ];

    public function test()
    {
        return $this->belongsTo(CbtTest::class, 'cbt_test_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
