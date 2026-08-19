<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CreditScore;
use App\Models\Attendance;
use App\Models\CbtTest;
use App\Models\CbtQuestion;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin user
        $admin = User::where('email', 'admin@pto.com')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Admin Boss',
                'email' => 'admin@pto.com',
                'password' => 'admin123',
                'role' => 'admin',
                'status' => 'active',
                'joined' => now()->toDateString(),
            ]);
        } else {
            $admin->update([
                'password' => 'admin123',
                'role' => 'admin',
                'status' => 'active',
            ]);
        }

        // 2. Demo participant user (Alex Johnson)
        $alex = User::where('email', 'alex@demo.com')->first();
        if (!$alex) {
            $alex = User::create([
                'name' => 'Alex Johnson',
                'email' => 'alex@demo.com',
                'password' => 'demo123',
                'role' => 'participant',
                'status' => 'active',
                'joined' => now()->subMonths(5)->toDateString(),
                'about' => 'Working towards homeownership in 2026.',
            ]);
        } else {
            $alex->update([
                'password' => 'demo123',
                'role' => 'participant',
                'status' => 'active',
            ]);
        }

        // Attendance for Alex
        Attendance::updateOrCreate(
            ['user_id' => $alex->id],
            [
                'total' => 12,
                'attended' => 11,
            ]
        );

        // Credit Scores for Alex if none exist
        if ($alex->creditHistory()->count() === 0) {
            $scores = [
                ['month' => '2026-01', 'score' => 580, 'note' => 'Program intake evaluation'],
                ['month' => '2026-02', 'score' => 610, 'note' => 'Disputed erroneous collection'],
                ['month' => '2026-03', 'score' => 640, 'note' => 'Lowered utilization to 15%'],
                ['month' => '2026-04', 'score' => 675, 'note' => 'Added trade line / secured loan'],
                ['month' => '2026-05', 'score' => 710, 'note' => 'Loan Assistance Unlocked!'],
            ];

            foreach ($scores as $s) {
                CreditScore::create([
                    'user_id' => $alex->id,
                    'month' => $s['month'],
                    'score' => $s['score'],
                    'note' => $s['note'],
                ]);
            }
        }

        // Sample CBT Test if none exist
        if (CbtTest::count() === 0) {
            $test = CbtTest::create([
                'course' => 'Financial Literacy & Credit Mastery 101',
                'timeLapsMinutes' => 15,
                'status' => 'published',
            ]);

            $questions = [
                [
                    'question' => 'What is the recommended maximum credit utilization ratio?',
                    'optionA' => '10% - 30%',
                    'optionB' => '50% - 70%',
                    'optionC' => '80% - 100%',
                    'optionD' => 'Utilization does not matter',
                    'answer' => 'A',
                ],
                [
                    'question' => 'Which factor has the largest impact on your credit score?',
                    'optionA' => 'Payment history (35%)',
                    'optionB' => 'Types of credit used (10%)',
                    'optionC' => 'New credit inquiries (10%)',
                    'optionD' => 'Length of credit history (15%)',
                    'answer' => 'A',
                ],
                [
                    'question' => 'How long do hard credit inquiries typically remain on your credit report?',
                    'optionA' => 'Up to 2 years',
                    'optionB' => '7 years',
                    'optionC' => '10 years',
                    'optionD' => 'Indefinitely',
                    'answer' => 'A',
                ],
            ];

            foreach ($questions as $q) {
                $test->questions()->create($q);
            }
        }

        // Sample Curriculum Frameworks if none exist
        if (\App\Models\CurriculumFramework::count() === 0) {
            $modules = [
                [
                    'week' => 1,
                    'title' => 'Credit Fundamentals & Bureau Reporting',
                    'topics' => ['FICO vs VantageScore algorithms', 'Understanding credit utilization thresholds', 'How to read a 3-bureau credit report'],
                    'content' => 'This module establishes core competencies in credit bureau mechanics, scoring models, and derogatory mark mitigation.',
                ],
                [
                    'week' => 2,
                    'title' => 'Debt Optimization & Budgetary Frameworks',
                    'topics' => ['Snowball vs Avalanche debt strategies', 'Debt-to-Income (DTI) ratio calculations', 'Automated savings systems'],
                    'content' => 'Learn how to optimize household cashflow to maximize monthly credit score improvements.',
                ],
                [
                    'week' => 3,
                    'title' => 'Trade Line Engineering & Credit Repair',
                    'topics' => ['Strategic authorized user tradelines', 'Credit bureau dispute strategies (FCRA)', 'Secured cards and builder loans'],
                    'content' => 'Deep dive into credit rebuilding tools, dispute templates, and rapid score elevation techniques.',
                ],
                [
                    'week' => 4,
                    'title' => 'Mortgage Readiness & Loan Underwriting',
                    'topics' => ['FHA vs Conventional vs USDA loan criteria', 'Down payment assistance programs', 'Closing costs and final escrow preparation'],
                    'content' => 'Final step: Prepare all institutional documentation for underwriting approval and lock in prime loan terms.',
                ],
            ];

            foreach ($modules as $m) {
                \App\Models\CurriculumFramework::create($m);
            }
        }
    }
}
