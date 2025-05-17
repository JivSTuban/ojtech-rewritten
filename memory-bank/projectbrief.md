# Project Brief: OJTech Replication

## 1. Project Goal
Replicate an existing Next.js/Supabase application (referred to as `@OJTech` or the original application) with a new technology stack. The new stack will consist of a React (Vite) frontend and a Spring Boot backend. The goal is to retain the original application's design, features, and user experience.

## 2. Core Requirements
- **Feature Parity:** Implement all major features present in the original application. This includes but is not limited to:
    - User authentication (registration, login, email verification - though email verification is TBD in the new stack)
    - Role-based access control (Student, Employer, Admin)
    - Student onboarding and profile management (CV upload)
    - Employer onboarding and profile management (company logo upload)
    - Job posting and management for employers
    - Public job listings and search for students/guests
    - Job application submission by students
    - Viewing job applications by employers
- **Technology Stack:**
    - **Frontend:** React with Vite
    - **Backend:** Spring Boot (Java)
    - **Authentication:** JWT (JSON Web Tokens)
    - **Database (Backend):** H2 (for development/initial phase, may change for production)
    - **Image/File Storage:** Cloudinary
- **Design Consistency:** The new application should visually resemble the original application.
- **User Experience:** Maintain a similar and intuitive user experience.

## 3. Scope
The initial scope focuses on replicating the core functionalities related to students, employers, and job opportunities. Administrative functionalities might be a later phase.

### In Scope:
- User registration (Student, Employer)
- User login
- Student Profile (onboarding, view, edit, CV upload)
- Employer Profile (onboarding, view, edit, logo upload)
- Employer Job Management (create, read, update, delete, list own jobs)
- Public Job Listing (search, view details)
- Student Job Application (apply to jobs)
- Employer: View applications for their jobs

### Out of Scope (Initially):
- Admin dashboard and functionalities
- Email verification (unless explicitly prioritized)
- Advanced search filters beyond basic title search (for now)
- Real-time notifications
- Any features not explicitly part of the core student/employer/job lifecycle described.

## 4. Key Stakeholders
- User (Developer)

## 5. Success Metrics
- Successful replication of all in-scope features.
- Smooth user experience comparable to the original application.
- Stable and functional backend and frontend components.
- Codebase that is maintainable and scalable.
