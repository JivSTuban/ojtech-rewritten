# OJTech - On-the-Job Training Platform

A comprehensive On-the-Job Training (OJT) management platform built with **React + Vite** (frontend) and **Spring Boot** (backend). The platform connects students seeking OJT opportunities with employers and includes administrative oversight from Network Liaison Officers (NLOs).

## 🎯 Project Overview

OJTech is a three-role platform designed to streamline the OJT process:
- **Students**: Browse opportunities, apply for jobs, manage profiles and generate AI-powered resumes
- **NLO (Network Liaison Officer)**: Post job opportunities, review applications, manage company profiles
- **Admin**: Oversee platform operations, manage users, and monitor activities

---

## 📁 Project Structure

This monorepo contains two main components:

```
ojtech-rewritten/
├── ojtech-vite/                  # React + Vite frontend
├── JavaSpringBootOAuth2JwtCrud/  # Spring Boot backend API
└── README.md                     # This file
```

---

## 🎨 Frontend (ojtech-vite)

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| TypeScript | 5.2.2 | Type safety |
| Vite | 5.1.0 | Build tool |
| React Router | 6.22.2 | Client-side routing |
| Tailwind CSS | 3.4.0 | Styling framework |
| Radix UI | Latest | UI component primitives |
| React Hook Form | 7.53.0 | Form management |
| Zod | 3.23.8 | Schema validation |
| Axios | 1.9.0 | HTTP client |
| Framer Motion | 12.10.3 | Animations |
| EmailJS | 4.4.1 | Email functionality |
| Next Themes | 0.3.0 | Dark/light mode |

### Key Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Google OAuth2 integration
- Role-based access control (Student, NLO, Admin)

✅ **Student Features**
- Profile management with education, skills, certifications
- AI-powered resume generation using Google Gemini API
- Job opportunity browsing with swipe interface
- Job application tracking
- CV upload and management
- Email verification and password reset

✅ **NLO (Network Liaison Officer) Features**
- Company profile management
- Job posting creation and editing
- Application review and management
- Student profile viewing
- Application status updates

✅ **Admin Features**
- User management dashboard
- Platform oversight and monitoring
- User profile administration

✅ **UI/UX Features**
- Responsive design (mobile, tablet, desktop)
- Dark and light mode support
- Toast notifications
- Modal dialogs
- Form validation with real-time feedback
- File upload with drag-and-drop

### Directory Structure

```
ojtech-vite/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── admin/            # Admin-specific components
│   │   ├── auth/             # Login, register, password reset
│   │   ├── cv/               # CV viewer and generator
│   │   ├── employer/         # Legacy employer components
│   │   ├── jobs/             # Job cards and listings
│   │   ├── layouts/          # Page layouts and navigation
│   │   ├── nlo/              # NLO-specific components
│   │   ├── onboarding/       # Onboarding flows
│   │   ├── pdf/              # PDF utilities
│   │   ├── profile/          # Profile management
│   │   ├── resume/           # Resume management
│   │   ├── student/          # Student-specific components
│   │   ├── survey/           # Survey components
│   │   └── ui/               # Reusable UI components (Radix UI)
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── api/              # API service layer
│   │   │   ├── authService.ts
│   │   │   ├── profileService.ts
│   │   │   ├── jobService.ts
│   │   │   ├── jobApplicationService.ts
│   │   │   ├── cvGeneratorService.ts
│   │   │   ├── nloService.ts
│   │   │   └── adminService.ts
│   │   ├── config/           # Configuration files
│   │   ├── templates/        # Email and document templates
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── pages/
│   │   ├── admin/            # Admin pages
│   │   ├── nlo/              # NLO pages (jobs, applications, profile)
│   │   ├── onboarding/       # Student and employer onboarding
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── OpportunitiesPage.tsx
│   │   ├── JobDetailPage.tsx
│   │   ├── TrackApplicationsPage.tsx
│   │   └── ResumeManagementPage.tsx
│   ├── providers/            # Context providers (Auth, Theme)
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Environment Variables

Create a `.env.local` file in the `ojtech-vite` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8081/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Gemini AI (for resume generation)
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# EmailJS (for email functionality)
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
```

### Setup & Running

```bash
cd ojtech-vite
npm install
npm run dev         # Development server (localhost:5173)
npm run build       # Production build
npm run preview     # Preview production build
```

---

## ⚙️ Backend (JavaSpringBootOAuth2JwtCrud)

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 | Programming language |
| Spring Boot | 3.2.3 | Application framework |
| Spring Security | Latest | Security and authentication |
| Spring Data JPA | Latest | Database ORM |
| JWT (jjwt) | 0.11.5 | Token authentication |
| OAuth2 Client | Latest | Social login |
| H2 Database | Latest | Development database |
| PostgreSQL | Latest | Production database |
| Cloudinary | 1.34.0 | File storage |
| SendGrid | 4.10.3 | Email service |
| SpringDoc OpenAPI | 2.3.0 | API documentation |
| Spring DotEnv | 4.0.0 | Environment variables |

### Key Features

✅ **Security & Authentication**
- JWT token-based authentication
- OAuth2 integration (Google, GitHub)
- BCrypt password encryption
- Role-based authorization (STUDENT, NLO, ADMIN)
- Email verification
- Password reset functionality

✅ **User Management**
- User registration and login
- Profile management (Student, NLO, Admin)
- Email verification workflow
- Password reset via email

✅ **Job Management**
- Job posting CRUD operations
- Job search and filtering
- Pagination support
- Job matching algorithms

✅ **Application Management**
- Job application submission
- Application status tracking
- Application history
- Email notifications

✅ **File Management**
- CV upload to Cloudinary
- Company logo upload
- Profile picture upload
- Document management

✅ **Email Services**
- Brevo (SendGrid) integration
- Email verification
- Password reset emails
- Application notification emails

### Directory Structure

```
JavaSpringBootOAuth2JwtCrud/
├── src/
│   ├── main/
│   │   ├── java/com/ojtechapi/spring/jwtoauth/
│   │   │   ├── config/           # Application configuration
│   │   │   ├── controller/       # REST API controllers
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── AdminStudentController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CVController.java
│   │   │   │   ├── CompanyController.java
│   │   │   │   ├── JobController.java
│   │   │   │   ├── JobApplicationController.java
│   │   │   │   ├── JobMatchController.java
│   │   │   │   ├── NLOCompanyController.java
│   │   │   │   ├── NLOProfileController.java
│   │   │   │   ├── NLOStudentController.java
│   │   │   │   ├── OAuth2Controller.java
│   │   │   │   ├── ProfileController.java
│   │   │   │   └── StudentProfileController.java
│   │   │   ├── dtos/              # Data Transfer Objects
│   │   │   │   ├── requests/      # Request DTOs
│   │   │   │   └── responses/     # Response DTOs
│   │   │   ├── entities/          # JPA entities (User, Job, Application, etc.)
│   │   │   ├── exceptions/        # Custom exceptions
│   │   │   ├── repositories/      # Spring Data JPA repositories
│   │   │   ├── security/          # Security configuration
│   │   │   │   ├── jwt/           # JWT implementation
│   │   │   │   └── oauth2/        # OAuth2 handlers
│   │   │   ├── seeds/             # Database seeders
│   │   │   └── service/           # Business logic services
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-prod.properties
│   │       └── db/migration/      # Database migrations
│   └── test/                       # Unit and integration tests
├── .env.example                    # Environment variables template
├── ENV_SETUP.md                    # Environment setup guide
├── README_ENV.md                   # Environment documentation
├── pom.xml                         # Maven dependencies
├── Dockerfile                      # Docker configuration
└── render.yaml                     # Render deployment config
```

### Environment Variables

Create a `.env` file in the `JavaSpringBootOAuth2JwtCrud` directory:

```env
# Server Configuration
PORT=8081

# Database Configuration (H2 for development)
DATABASE_URL=jdbc:h2:mem:testdb
DATABASE_USERNAME=sa
DATABASE_PASSWORD=password

# Database Configuration (PostgreSQL for production)
# DATABASE_URL=jdbc:postgresql://localhost:5432/ojtech
# DATABASE_USERNAME=postgres
# DATABASE_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long
JWT_EXPIRATION_MS=86400000

# OAuth2 - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth2 - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_PRESET=OJTECHPDF

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Brevo/SendGrid)
EMAIL_ENABLED=true
BREVO_API_KEY=your_brevo_api_key
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
SPRING_MAIL_EMAIL=your_verified_sender@gmail.com

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8081
```

> **📘 Note**: See `ENV_SETUP.md` for detailed environment setup instructions.

### Setup & Running

```bash
cd JavaSpringBootOAuth2JwtCrud

# Copy environment template
cp .env.example .env
# Edit .env with your actual credentials

# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run

# Run with production profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# Run tests
./mvnw test

# Skip tests
./mvnw clean package -DskipTests
```

The API will be available at `http://localhost:8081`

**API Documentation**: `http://localhost:8081/swagger-ui.html`

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| POST | `/api/auth/verify-email` | Verify email | Public |

### Profile Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/profile/student/me` | Get student profile | Student |
| POST | `/api/profile/student/onboarding-v2` | Complete student onboarding | Student |
| POST | `/api/profile/student/cv` | Upload CV | Student |
| POST | `/api/profile/student/avatar` | Upload profile picture | Student |
| GET | `/api/profile/nlo/me` | Get NLO profile | NLO |
| POST | `/api/profile/nlo/onboarding` | Complete NLO onboarding | NLO |
| POST | `/api/profile/nlo/logo` | Upload company logo | NLO |

### Job Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/jobs` | Get all jobs (paginated) | Public |
| GET | `/api/jobs/{id}` | Get job by ID | Public |
| POST | `/api/jobs` | Create job posting | NLO |
| PUT | `/api/jobs/{id}` | Update job posting | NLO |
| DELETE | `/api/jobs/{id}` | Delete job posting | NLO |
| GET | `/api/jobs/nlo/my-jobs` | Get NLO's posted jobs | NLO |
| GET | `/api/jobs/search` | Search jobs | Public |

### Job Applications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/applications/apply/{jobId}` | Apply for a job | Student |
| GET | `/api/applications/my-applications` | Get student's applications | Student |
| GET | `/api/applications/{id}` | Get application details | Student/NLO |
| GET | `/api/applications/job/{jobId}` | Get job applications | NLO |
| PUT | `/api/applications/{id}/status` | Update application status | NLO |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/users` | Get all users | Admin |
| GET | `/api/admin/users/{id}` | Get user by ID | Admin |
| PUT | `/api/admin/users/{id}` | Update user | Admin |
| DELETE | `/api/admin/users/{id}` | Delete user | Admin |
| GET | `/api/admin/students` | Get all students | Admin |

---

## 🛣️ Frontend Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/forgot-password` | ForgotPasswordPage | Password reset request |
| `/reset-password` | ResetPasswordPage | Password reset form |
| `/verify-email` | VerifyEmailPage | Email verification |
| `/opportunities` | OpportunitiesPage | Browse jobs |
| `/opportunities/:id` | JobDetailPage | Job details |
| `/privacy` | PrivacyPage | Privacy policy |
| `/terms` | TermsPage | Terms of service |

### Student Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/onboarding/student` | StudentOnboardingPage | Student onboarding |
| `/profile` | ProfilePage | Student profile |
| `/resume` | ResumeManagementPage | Resume management |
| `/track` | TrackApplicationsPage | Application tracking |
| `/application/:id` | ApplicationDetailsPage | Application details |

### NLO Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/onboarding/employer` | EmployerOnboardingPage | NLO onboarding |
| `/nlo/profile` | NLOProfilePage | NLO profile |
| `/nlo/jobs` | NLOJobsPage | Manage job postings |
| `/nlo/jobs/create` | JobFormPage | Create job posting |
| `/nlo/jobs/edit/:jobId` | JobFormPage | Edit job posting |
| `/nlo/jobs/:jobId` | JobDetailsPage | Job details |
| `/nlo/jobs/:jobId/applications` | JobApplicationsPage | View applications |
| `/nlo/students/:studentId` | StudentDetailsPage | View student profile |

### Admin Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | AdminDashboardPage | Admin dashboard |
| `/admin/users` | UsersAdminPage | User management |
| `/admin/profile/:userId` | AdminProfilePage | User profile admin |

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
cd ojtech-vite
npm run build

# Output in dist/ directory
```

**Environment Variables to Set:**
- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GEMINI_API_KEY`
- `VITE_EMAILJS_PUBLIC_KEY`

### Backend Deployment (Render/Railway/AWS)

```bash
cd JavaSpringBootOAuth2JwtCrud
./mvnw clean package -DskipTests

# JAR file in target/ directory
```

**Environment Variables to Set:**
- Database credentials (PostgreSQL)
- JWT_SECRET
- OAuth credentials (Google, GitHub)
- Cloudinary credentials
- Email service credentials (Brevo)
- FRONTEND_URL and BACKEND_URL

See `render.yaml` for Render.com deployment configuration.

---

## 🧪 Testing

### Frontend Tests

```bash
cd ojtech-vite
npm run test
```

### Backend Tests

```bash
cd JavaSpringBootOAuth2JwtCrud
./mvnw test
```

---

## 📝 Development Guidelines

- **Code Style**: Follow ESLint/Prettier for frontend, Java conventions for backend
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)
- **Branching**: Use feature branches, PR to main
- **Testing**: Write tests for critical functionality
- **Documentation**: Document complex logic and API changes

---

## 🔒 Security Notes

- Never commit `.env` files
- Use strong JWT secrets (256+ bits)
- Rotate API keys regularly
- Keep dependencies updated
- Use HTTPS in production
- Validate all user inputs
- Sanitize data before database operations

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 👥 Contributors

Developed by the OJTech Team

---

## 📚 Additional Documentation

- [Backend README](JavaSpringBootOAuth2JwtCrud/README.md)
- [Frontend README](ojtech-vite/README.md)
- [Environment Setup Guide](JavaSpringBootOAuth2JwtCrud/ENV_SETUP.md)
- [Environment Variables](JavaSpringBootOAuth2JwtCrud/README_ENV.md)

---

## 🆘 Troubleshooting

**CORS Errors?**
- Check `FRONTEND_URL` is set correctly in backend `.env`
- Verify backend is running on expected port

**Authentication Issues?**
- Ensure JWT_SECRET is the same in backend
- Check Google OAuth credentials are correct
- Verify token is being sent in Authorization header

**File Upload Failures?**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper MIME types

**Email Not Sending?**
- Verify Brevo API key is valid
- Check sender email is verified
- Review email configuration in backend

For more help, see individual README files in each directory.