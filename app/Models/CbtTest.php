<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CbtTest extends Model
{
    use HasFactory;

    protected $fillable = ['course', 'timeLapsMinutes'];

    public function questions()
    {
        return $this->hasMany(CbtQuestion::class);
    }
}
