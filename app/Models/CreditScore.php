<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditScore extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'month', 'score', 'note'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
