# CreadIt Backend (Laravel)

This is the fully functioning Laravel API for the CreadIt Credit Score and CBT Testing Platform.

## Requirements
- PHP 8.2 or greater
- Composer
- SQLite (default) or MySQL for cPanel deployment

## Installation & Local Setup

1. **Install Dependencies**:
   \`\`\`bash
   composer install
   \`\`\`

2. **Environment Configuration**:
   - Copy `.env.example` to `.env` (already done if generated locally).
   - Generate your app key:
   \`\`\`bash
   php artisan key:generate
   \`\`\`
   - By default, `DB_CONNECTION` is set to `sqlite`.

3. **Migrate the Database**:
   \`\`\`bash
   php artisan migrate:fresh
   \`\`\`
   *(Note: This creates the tables for Users, CreditScores, Attendances, and CBT components)*

4. **Run the API Server Locally**:
   \`\`\`bash
   php artisan serve
   \`\`\`
   The API will be accessible at `http://localhost:8000/api`.

## Available API Endpoints

### Authentication
- `POST /api/register` - Register a new participant
- `POST /api/login` - Login to account
- `POST /api/logout` - Securely log out (Sanctum Authenticated)
- `GET /api/me` - Get current user profile (with related credit scores and attendance details)
- `GET /api/users` - Fetch all participants (Admin route)

### Core Features
- `POST /api/credit-scores` - Update/add a credit score for the user
- `POST /api/attendances` - Log/Update class attendance

### CBT Dashboard
- `POST /api/cbt-tests` - For Admins to configure a new CBT Test (subject, time, questions structure)
- `GET /api/cbt-tests` - Fetch all tests (Admin / Participant)
- `GET /api/cbt-tests/{id}` - Start a test (Fetches single test and auto-randomizes questions logic in controller)

### Deployment to cPanel
When you upload this to cPanel:
1. Update your `.env` to set `DB_CONNECTION=mysql` and apply your cPanel database credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
2. Run database migrations on the cPanel server (or export your local SQL and import to phpMyAdmin).
3. Update the frontend's API Base URL to point to your new live domain `https://yourdomain.com/api` instead of `http://localhost:8000/api`.
