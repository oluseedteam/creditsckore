<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurriculumFramework extends Model
{
    protected $fillable = ['week', 'title', 'topics', 'cbt_test_id', 'content', 'file_path'];

    protected $casts = [
        'topics' => 'array',
    ];

    public function cbtTest()
    {
        return $this->belongsTo(CbtTest::class);
    }
}
