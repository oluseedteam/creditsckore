<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use RuntimeException;

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

    public function verifyPassword(string $plainPassword): bool
    {
        $hashedPassword = $this->getAuthPassword();

        if ($hashedPassword === null || $hashedPassword === '') {
            return false;
        }

        if (Hash::isHashed($hashedPassword)) {
            try {
                return Hash::check($plainPassword, $hashedPassword);
            } catch (RuntimeException) {
                return password_verify($plainPassword, $hashedPassword);
            }
        }

        return hash_equals($hashedPassword, $plainPassword);
    }

    public function rehashPasswordIfRequired(string $plainPassword): void
    {
        $hashedPassword = $this->getAuthPassword();

        if (! Hash::isHashed($hashedPassword)) {
            $this->forceFill(['password' => $plainPassword])->save();

            return;
        }

        try {
            if (Hash::needsRehash($hashedPassword)) {
                $this->forceFill(['password' => $plainPassword])->save();
            }
        } catch (RuntimeException) {
            $this->forceFill(['password' => $plainPassword])->save();
        }
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
