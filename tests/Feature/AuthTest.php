<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_protected_route_accepts_bearer_token_after_login(): void
    {
        $user = User::factory()->create([
            'status' => 'active',
            'role' => 'admin',
            'password' => 'password',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $login->assertOk()
            ->assertJsonStructure(['token', 'user']);

        $token = $login->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/users')
            ->assertOk();
    }
}
