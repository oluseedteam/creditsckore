<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * End-to-end tests for the admin user-approval workflow.
 *
 * Flow under test:
 *   1. User registers  → status = 'pending'
 *   2. User tries login while pending → 422 blocked
 *   3. Admin lists pending users → sees the registrant
 *   4. Admin approves (sets active) → 200, approval email sent
 *   5. User can now login → 200, token returned
 *   6. Admin can suspend the user → 200
 *   7. Suspended user is blocked on login → 422
 *   8. Non-admin cannot call admin endpoints → 403
 *   9. Admin can re-activate a suspended user → 200
 *  10. Admin cannot set status to 'pending' → 422
 */
class AdminApprovalTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Create and return a token for an admin user. */
    private function adminToken(): string
    {
        $admin = User::factory()->create([
            'role'   => 'admin',
            'status' => 'active',
        ]);
        return $admin->createToken('test')->plainTextToken;
    }

    /** Create and return a token for an active participant. */
    private function participantToken(): string
    {
        $user = User::factory()->create([
            'role'   => 'participant',
            'status' => 'active',
        ]);
        return $user->createToken('test')->plainTextToken;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Registration creates a pending account
    // ─────────────────────────────────────────────────────────────────────────

    public function test_registration_creates_pending_account(): void
    {
        $response = $this->postJson('/api/register', [
            'name'     => 'John Doe',
            'email'    => 'john@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(201)
                 ->assertJson(['message' => 'Registration successful. Your account is pending admin approval.']);

        $this->assertDatabaseHas('users', [
            'email'  => 'john@example.com',
            'status' => 'pending',
            'role'   => 'participant',
        ]);

        // Attendance record should be initialised
        $user = User::where('email', 'john@example.com')->first();
        $this->assertDatabaseHas('attendances', [
            'user_id' => $user->id,
            'total'   => 0,
            'attended'=> 0,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Pending user cannot login
    // ─────────────────────────────────────────────────────────────────────────

    public function test_pending_user_cannot_login(): void
    {
        User::factory()->create([
            'email'  => 'pending@example.com',
            'status' => 'pending',
            'role'   => 'participant',
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'pending@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
                 ->assertJsonPath('errors.email.0', fn ($v) => str_contains($v, 'pending'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Admin can list pending users
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_pending_users(): void
    {
        User::factory()->create(['status' => 'pending', 'role' => 'participant']);
        User::factory()->create(['status' => 'active',  'role' => 'participant']);

        $response = $this->withToken($this->adminToken())
                         ->getJson('/api/users?status=pending');

        $response->assertOk();
        $this->assertCount(1, $response->json());
        $this->assertEquals('pending', $response->json('0.status'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Admin can list ALL users (no status filter)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_all_users_without_filter(): void
    {
        User::factory()->count(3)->create(['role' => 'participant', 'status' => 'pending']);
        User::factory()->count(2)->create(['role' => 'participant', 'status' => 'active']);

        $response = $this->withToken($this->adminToken())->getJson('/api/users');

        $response->assertOk();
        $this->assertCount(5, $response->json());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Admin approves a pending user — sends email, user can then login
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_approves_pending_user_and_user_can_login(): void
    {
        Mail::fake();

        $participant = User::factory()->create([
            'email'  => 'newuser@example.com',
            'status' => 'pending',
            'role'   => 'participant',
        ]);

        // Admin approves
        $approveResponse = $this->withToken($this->adminToken())
                                ->patchJson("/api/users/{$participant->id}/status", [
                                    'status' => 'active',
                                ]);

        $approveResponse->assertOk()
                        ->assertJsonPath('user.status', 'active');

        $this->assertDatabaseHas('users', [
            'id'     => $participant->id,
            'status' => 'active',
        ]);

        // Approval email should have been dispatched
        Mail::assertSent(\App\Mail\AccountVerified::class, function ($mail) use ($participant) {
            return $mail->hasTo($participant->email);
        });

        // User can now login
        $loginResponse = $this->postJson('/api/login', [
            'email'    => 'newuser@example.com',
            'password' => 'password',
        ]);

        $loginResponse->assertOk()
                      ->assertJsonStructure(['token', 'user'])
                      ->assertJsonPath('user.status', 'active');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Admin suspends an active user
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_suspend_active_user(): void
    {
        $participant = User::factory()->create([
            'status' => 'active',
            'role'   => 'participant',
        ]);

        $response = $this->withToken($this->adminToken())
                         ->patchJson("/api/users/{$participant->id}/status", [
                             'status' => 'suspended',
                         ]);

        $response->assertOk()
                 ->assertJsonPath('user.status', 'suspended');

        $this->assertDatabaseHas('users', [
            'id'     => $participant->id,
            'status' => 'suspended',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Suspended user is blocked from logging in
    // ─────────────────────────────────────────────────────────────────────────

    public function test_suspended_user_cannot_login(): void
    {
        User::factory()->create([
            'email'  => 'suspended@example.com',
            'status' => 'suspended',
            'role'   => 'participant',
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'suspended@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
                 ->assertJsonPath('errors.email.0', fn ($v) => str_contains(strtolower($v), 'suspended'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Participant cannot call admin-only endpoints
    // ─────────────────────────────────────────────────────────────────────────

    public function test_participant_cannot_access_admin_user_list(): void
    {
        $this->withToken($this->participantToken())
             ->getJson('/api/users')
             ->assertStatus(403);
    }

    public function test_participant_cannot_update_user_status(): void
    {
        $target = User::factory()->create(['status' => 'pending', 'role' => 'participant']);

        $this->withToken($this->participantToken())
             ->patchJson("/api/users/{$target->id}/status", ['status' => 'active'])
             ->assertStatus(403);

        // Status must remain unchanged
        $this->assertDatabaseHas('users', ['id' => $target->id, 'status' => 'pending']);
    }

    public function test_participant_cannot_delete_a_user(): void
    {
        $target = User::factory()->create(['role' => 'participant', 'status' => 'active']);

        $this->withToken($this->participantToken())
             ->deleteJson("/api/users/{$target->id}")
             ->assertStatus(403);

        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. Unauthenticated callers are rejected
    // ─────────────────────────────────────────────────────────────────────────

    public function test_unauthenticated_cannot_access_user_list(): void
    {
        $this->getJson('/api/users')->assertStatus(401);
    }

    public function test_unauthenticated_cannot_update_status(): void
    {
        $target = User::factory()->create(['status' => 'pending', 'role' => 'participant']);
        $this->patchJson("/api/users/{$target->id}/status", ['status' => 'active'])->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 10. Admin can re-activate a suspended user
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_reactivate_suspended_user(): void
    {
        Mail::fake();

        $participant = User::factory()->create([
            'email'  => 'reactivate@example.com',
            'status' => 'suspended',
            'role'   => 'participant',
        ]);

        $response = $this->withToken($this->adminToken())
                         ->patchJson("/api/users/{$participant->id}/status", [
                             'status' => 'active',
                         ]);

        $response->assertOk()->assertJsonPath('user.status', 'active');

        // Suspended → active transition should NOT trigger approval email
        Mail::assertNothingSent();

        // User can now login again
        $this->postJson('/api/login', [
            'email'    => 'reactivate@example.com',
            'password' => 'password',
        ])->assertOk();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 11. Admin cannot set status to 'pending' (invalid transition)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_cannot_set_status_to_pending(): void
    {
        $participant = User::factory()->create([
            'status' => 'active',
            'role'   => 'participant',
        ]);

        $this->withToken($this->adminToken())
             ->patchJson("/api/users/{$participant->id}/status", ['status' => 'pending'])
             ->assertStatus(422);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 12. Admin can delete a user
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_delete_user(): void
    {
        $participant = User::factory()->create(['role' => 'participant', 'status' => 'pending']);

        $this->withToken($this->adminToken())
             ->deleteJson("/api/users/{$participant->id}")
             ->assertOk()
             ->assertJson(['message' => 'User deleted successfully']);

        $this->assertDatabaseMissing('users', ['id' => $participant->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 13. Full round-trip: register → list → approve → login → me
    // ─────────────────────────────────────────────────────────────────────────

    public function test_full_registration_approval_login_flow(): void
    {
        Mail::fake();
        $adminToken = $this->adminToken();

        // Step 1 – Register
        $this->postJson('/api/register', [
            'name'     => 'Alice',
            'email'    => 'alice@example.com',
            'password' => 'pass1234',
        ])->assertStatus(201);

        // Step 2 – Blocked at login
        $this->postJson('/api/login', [
            'email'    => 'alice@example.com',
            'password' => 'pass1234',
        ])->assertStatus(422);

        // Step 3 – Admin sees Alice in pending list
        $listResp = $this->withToken($adminToken)->getJson('/api/users?status=pending');
        $listResp->assertOk();
        $this->assertGreaterThanOrEqual(1, count($listResp->json()));

        $alice = User::where('email', 'alice@example.com')->first();

        // Step 4 – Admin approves
        $this->withToken($adminToken)
             ->patchJson("/api/users/{$alice->id}/status", ['status' => 'active'])
             ->assertOk();

        // Step 5 – Alice can login
        $loginResp = $this->postJson('/api/login', [
            'email'    => 'alice@example.com',
            'password' => 'pass1234',
        ])->assertOk()->assertJsonStructure(['token', 'user']);

        $aliceToken = $loginResp->json('token');

        // Step 6 – Alice can hit /me
        $this->withToken($aliceToken)
             ->getJson('/api/me')
             ->assertOk()
             ->assertJsonPath('user.email', 'alice@example.com')
             ->assertJsonPath('user.status', 'active');
    }
}
