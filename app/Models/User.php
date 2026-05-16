<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'joined',
        'status',
        'profile_picture',
        'about'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function creditHistory()
    {
        return $this->hasMany(CreditScore::class)->orderBy('month', 'asc');
    }

    public function attendance()
    {
        return $this->hasOne(Attendance::class);
    }

    public function cbtResults()
    {
        return $this->hasMany(CbtResult::class);
    }

    public function dailyAttendances()
    {
        return $this->hasMany(DailyAttendance::class)->orderBy('date', 'asc');
    }
}
