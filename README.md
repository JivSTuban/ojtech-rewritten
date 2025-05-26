# OJTech - Job Platform

A comprehensive job platform built with React (frontend) and Spring Boot (backend) to connect students with job opportunities.

## Project Structure

The project consists of two main components:

### 1. Frontend (ojtech-vite)

A React-based single-page application built with Vite, TypeScript, and Tailwind CSS.

- *Tech Stack*:
  - React 18.2.0
  - TypeScript 5.2.2
  - Vite 5.1.0
  - React Router 6.22.2
  - Tailwind CSS 3.4.0
  - Radix UI primitives (direct implementation, not shadcn/ui)
  - React Hook Form 7.53.0 with Zod validation
  - Axios 1.9.0 for API requests
  - Next-themes for dark/light mode
  - EmailJS for email functionality
  - Google OAuth integration for authentication
  - Framer Motion for animations

- *Key Features*:
  - User authentication with JWT and OAuth2
  - Role-based access control (Student, Employer, Admin)
  - Onboarding flows for students and employers
  - Job listing and application system
  - Resume management
  - Application tracking
  - Responsive design with dark/light mode support
  - Toast notifications

- *Directory Structure*:
  
  ojtech-vite/
  ├── public/             # Static assets
  ├── src/
  │   ├── components/     # Reusable UI components
  │   │   ├── auth/       # Authentication components
  │   │   ├── employer/   # Employer-specific components
  │   │   ├── jobs/       # Job-related components
  │   │   ├── layouts/    # Layout components
  │   │   ├── onboarding/ # Onboarding components
  │   │   ├── profile/    # User profile components
  │   │   ├── resume/     # Resume management components
  │   │   ├── survey/     # Survey components
  │   │   └── ui/         # UI component library
  │   ├── hooks/          # Custom React hooks
  │   ├── lib/            # Utility libraries
  │   │   ├── api/        # API client functions
  │   │   ├── templates/  # Template files
  │   │   ├── types/      # TypeScript type definitions
  │   │   └── utils/      # Utility functions
  │   ├── pages/          # Page components
  │   │   ├── admin/      # Admin pages
  │   │   ├── employer/   # Employer pages
  │   │   └── onboarding/ # Onboarding pages
  │   ├── providers/      # Context providers
  │   ├── App.tsx         # Main application component
  │   └── main.tsx        # Application entry point
  

- *Environment Variables*:
  - VITE_GOOGLE_CLIENT_ID: Google OAuth client ID
  - VITE_EMAILJS_PUBLIC_KEY: EmailJS public key
  - VITE_API_URL: Backend API URL

### 2. Backend (JavaSpringBootOAuth2JwtCrud)

A Spring Boot application providing RESTful API services with JWT authentication and OAuth2 integration.

- *Tech Stack*:
  - Java 17
  - Spring Boot 3.2.3
  - Spring Security
  - Spring Data JPA
  - JWT Authentication (jjwt 0.11.5)
  - OAuth2 Client
  - H2 Database (development)
  - Cloudinary for file storage
  - SpringDoc OpenAPI for API documentation
  - Spring Mail for email functionality

- *Key Features*:
  - RESTful API endpoints
  - JWT authentication
  - OAuth2 social login
  - Role-based authorization
  - Database migrations
  - Email notifications
  - File uploads via Cloudinary
  - Comprehensive API documentation with OpenAPI

- *Directory Structure*:
  
  JavaSpringBootOAuth2JwtCrud/
  ├── src/
  │   ├── main/
  │   │   ├── java/com/melardev/spring/jwtoauth/
  │   │   │   ├── config/         # Application configuration
  │   │   │   ├── controller/     # REST controllers
  │   │   │   ├── dtos/           # Data transfer objects
  │   │   │   │   ├── requests/   # Request DTOs
  │   │   │   │   └── responses/  # Response DTOs
  │   │   │   ├── entities/       # JPA entities
  │   │   │   ├── exceptions/     # Custom exceptions
  │   │   │   ├── repositories/   # Spring Data repositories
  │   │   │   ├── security/       # Security configuration
  │   │   │   │   ├── jwt/        # JWT implementation
  │   │   │   │   └── oauth2/     # OAuth2 implementation
  │   │   │   ├── seeds/          # Database seeders
  │   │   │   └── service/        # Business logic services
  │   │   └── resources/
  │   │       └── db/migration/   # Database migrations
  │   └── test/                   # Test classes
  

- *Environment Variables*:
  - SPRING_DATASOURCE_URL: Database connection URL
  - SPRING_DATASOURCE_USERNAME: Database username
  - SPRING_DATASOURCE_PASSWORD: Database password
  - JWT_SECRET: Secret key for JWT token signing
  - JWT_EXPIRATION_MS: JWT token expiration time in milliseconds
  - CLOUDINARY_URL: Cloudinary configuration URL
  - SPRING_MAIL_HOST: SMTP server host
  - SPRING_MAIL_PORT: SMTP server port
  - SPRING_MAIL_USERNAME: Email username
  - SPRING_MAIL_PASSWORD: Email password
  - FRONTEND_URL: Frontend application URL for CORS and redirects

## Getting Started

### Frontend Setup

1. Navigate to the frontend directory:
   
   cd ojtech-vite
   

2. Install dependencies:
   
   npm install
   

3. Create a .env.local file with required environment variables:
   
   VITE_API_URL=http://localhost:8080
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   

4. Start the development server:
   
   npm run dev
   

### Backend Setup

1. Navigate to the backend directory:
   
   cd JavaSpringBootOAuth2JwtCrud
   

2. Create an application-dev.properties file in src/main/resources with your configuration:
   
properties
   # Database
   spring.datasource.url=jdbc:h2:mem:testdb
   spring.datasource.username=sa
   spring.datasource.password=
   spring.h2.console.enabled=true
   
   # JWT
   app.jwt.secret=your_jwt_secret_key
   app.jwt.expiration-ms=86400000
   
   # Cloudinary
   cloudinary.url=cloudinary://your_api_key:your_api_secret@your_cloud_name
   
   # Mail
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   
   # Frontend URL
   app.frontend.url=http://localhost:5173
   

3. Build the application:
   
   ./mvnw clean package -DskipTests
   

4. Run the application:
   
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   

## Available Routes

### Frontend Routes

- *Public Routes*:
  - /: Homepage
  - /login: User login
  - /register: User registration
  - /opportunities: Job listings
  - /opportunities/:id: Job details
  - /privacy: Privacy policy
  - /terms: Terms of service

- *Protected Routes*:
  - /profile: User profile
  - /resume: Resume management
  - /track: Application tracking
  - /application/:id: Application details
  - /opportunities/apply/:id: Job application form

- *Student Routes*:
  - /onboarding/student: Student onboarding

- *Employer Routes*:
  - /onboarding/employer: Employer onboarding
  - /employer/jobs: Employer job listings
  - /employer/jobs/create: Create job listing
  - /employer/jobs/edit/:jobId: Edit job listing
  - /employer/jobs/applications/:jobId: View job applications

- *Admin Routes*:
  - /admin/dashboard: Admin dashboard
  - /admin/users: User management

### Backend API Endpoints

- *Authentication*:
  - POST /api/auth/register: Register new user
  - POST /api/auth/login: User login
  - POST /api/auth/refresh-token: Refresh JWT token
  - GET /api/auth/me: Get current user profile

- *Users*:
  - GET /api/users: Get all users (admin only)
  - GET /api/users/{id}: Get user by ID
  - PUT /api/users/{id}: Update user
  - DELETE /api/users/{id}: Delete user

- *Jobs*:
  - GET /api/jobs: Get all jobs
  - GET /api/jobs/{id}: Get job by ID
  - POST /api/jobs: Create new job (employer only)
  - PUT /api/jobs/{id}: Update job (employer only)
  - DELETE /api/jobs/{id}: Delete job (employer only)

- *Applications*:
  - GET /api/applications: Get user applications
  - GET /api/applications/{id}: Get application by ID
  - POST /api/applications: Submit job application
  - PUT /api/applications/{id}/status: Update application status

- *Resumes*:
  - GET /api/resumes: Get user resumes
  - POST /api/resumes: Upload new resume
  - DELETE /api/resumes/{id}: Delete resume

## Development Guidelines

- *Code Style*: Follow consistent code style with ESLint and Prettier
- *Commits*: Use conventional commit messages
- *Testing*: Write unit and integration tests for critical functionality
- *Documentation*: Document all API endpoints and key components

## Deployment

- *Frontend*: Deploy to Vercel, Netlify, or similar static hosting
- *Backend*: Deploy to AWS, GCP, Azure, or similar cloud provider

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.