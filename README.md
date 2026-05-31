# MyScoreNova - Fullstack Ecosystem (Backend)

This is the central intelligence API for the MyScoreNova Credit Score and CBT Testing Platform. It handles authentication, real-time credit trajectory tracking, and session-based attendance marking.

## 🚀 Architectural Stack
- **Engine**: Laravel 11.x
- **Language**: PHP 8.2+
- **Security**: Laravel Sanctum (Token-based SPA Auth)
- **Database**: SQLite (Development) / MySQL (Production)
- **Mail**: Native Laravel Mailers (Configured for SMTP)

## 🛠 Installation & Local Setup

1. **Clone & Dependencies**:
   ```bash
   composer install
   ```

2. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Generate your encryption key:
   ```bash
   php artisan key:generate
   ```

3. **Database Initialization**:
   ```bash
   touch database/database.sqlite
   php artisan migrate:fresh --seed
   ```
   *(Initializes schemas for Users, CreditScores, Attendances, and CBT Infrastructure)*

4. **Serve the API**:
   ```bash
   php artisan serve
   ```
   The API will be available at `http://localhost:8000/api`.

## 🛰 Core API Blueprint

### Authentication Cluster
- `POST /api/register` - Participant onboarding (status defaults to `pending`)
- `POST /api/login` - Handshake & Token issuance
- `POST /api/me` - Synchronize session state & relations

### Metrics & Analytics
- `POST /api/credit-scores` - Log monthly credit position
- `POST /api/attendance/mark` - Session-based attendance tally (increments lifetime count)
- `POST /api/attendance/log` - Update aggregate attendance profile

### Assessment Engine
- `GET  /api/cbt-tests` - Discovery of published assessments
- `POST /api/cbt-results` - Submit completion data & triggerPass/Fail analytics

## 🌍 Production Guidelines (cPanel/VPS)
1. **DB Switch**: Update `.env` to `DB_CONNECTION=mysql`.
2. **Path Optimization**: Ensure `APP_URL` points to your live domain.
3. **Storage Perms**: Run `chmod -R 775 storage bootstrap/cache`.
4. **CORS**: Verify `config/cors.php` allows your frontend domain.

---
*Built for High-Trust Financial Literacy Frameworks.*
