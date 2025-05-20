# OJTech Technical Context

## Backend Technology Stack

### Core Framework
- **Spring Boot 3.2.3**: Main application framework
- **Java 17**: Programming language

### Data Layer
- **Spring Data JPA**: Data access layer
- **Hibernate**: ORM framework
- **H2 Database**: In-memory database for development
- **PostgreSQL**: Production database

### Security
- **Spring Security**: Authentication and authorization framework
- **JWT (JSON Web Tokens)**: Token-based authentication
- **JJWT 0.11.5**: JWT implementation library

### API Documentation
- **SpringDoc OpenAPI 2.3.0**: API documentation (Swagger UI)

### File Storage
- **Cloudinary 1.34.0**: Cloud-based file storage for resumes and images

### Build Tools
- **Maven**: Dependency management and build tool

## Frontend Technology Stack

### Core Framework
- **React 18.2.0**: UI library
- **TypeScript 5.2.2**: Type-safe JavaScript

### Build Tools
- **Vite 5.1.0**: Build tool and development server
- **ESLint 8.56.0**: Code quality and style enforcement

### Routing
- **React Router 6.22.2**: Client-side routing

### UI Components
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React 0.446.0**: Icon library
- **Framer Motion 12.10.3**: Animation library
- **React Spring 9.7.4**: Animation library for interactive elements

### Form Handling
- **React Hook Form 7.53.0**: Form state management
- **Zod 3.23.8**: Schema validation

### HTTP Client
- **Axios 1.9.0**: HTTP client for API requests

### Legacy Integration
- **Supabase JS 2.49.4**: Client for Supabase (being phased out)

## Development Environment

### Backend
- **Spring Boot DevTools**: Development productivity tools
- **Maven Wrapper**: Consistent build environment

### Frontend
- **TypeScript ESLint**: Static code analysis
- **Vite Dev Server**: Hot module replacement
- **PostCSS**: CSS processing

## API Structure

### Authentication Endpoints
- `POST /api/auth/signup`: User registration
- `POST /api/auth/signin`: User login
- `GET /api/auth/verify`: Token verification

### Profile Endpoints
- `GET /api/profiles`: Get all profiles
- `GET /api/profiles/{id}`: Get profile by ID
- `PUT /api/profiles/{id}`: Update profile
- `GET /api/student-profiles/{id}`: Get student profile
- `PUT /api/student-profiles/{id}`: Update student profile
- `GET /api/employers/{id}`: Get employer profile
- `PUT /api/employers/{id}`: Update employer profile

### Job Endpoints
- `GET /api/jobs`: Get all jobs
- `POST /api/jobs`: Create job
- `GET /api/jobs/{id}`: Get job by ID
- `PUT /api/jobs/{id}`: Update job
- `DELETE /api/jobs/{id}`: Delete job
- `GET /api/jobs/employer/{employerId}`: Get jobs by employer

### CV/Resume Endpoints
- `POST /api/cvs`: Upload CV
- `GET /api/cvs/{id}`: Get CV by ID
- `DELETE /api/cvs/{id}`: Delete CV
- `GET /api/cvs/student/{studentId}`: Get CVs by student

### Job Application Endpoints
- `POST /api/job-applications`: Submit job application
- `GET /api/job-applications/{id}`: Get application by ID
- `PUT /api/job-applications/{id}`: Update application status
- `GET /api/job-applications/job/{jobId}`: Get applications by job
- `GET /api/job-applications/student/{studentId}`: Get applications by student

### Job Matching Endpoints
- `GET /api/job-matching/student/{studentId}`: Get job matches for student
- `GET /api/job-matching/job/{jobId}`: Get student matches for job

## Database Schema

The database schema includes the following primary tables:

1. **users**: User authentication information
2. **profiles**: Basic user profile information
3. **student_profiles**: Student-specific profile details
4. **employer_profiles**: Employer organization information
5. **jobs**: Job postings with requirements
6. **cvs**: Resume/CV data with extracted skills
7. **job_applications**: Job application records
8. **matches**: Job-student match records
9. **skill_assessments**: Student skill self-assessments
10. **roles**: User role definitions

## Authentication Flow

1. User registers or logs in
2. Backend validates credentials
3. JWT token generated with user details and roles
4. Token returned to client
5. Client stores token in memory/local storage
6. Token included in Authorization header for subsequent requests
7. Backend validates token for protected endpoints
8. Token expiration handled with refresh mechanism

## Deployment Considerations

### Backend Deployment
- Spring Boot application packaged as JAR
- Environment-specific configuration via properties files
- Database migration with Flyway
- Potential containerization with Docker

### Frontend Deployment
- Static assets built with Vite
- Environment variables for API endpoints
- Potential deployment to CDN or static hosting

## Technical Challenges

1. **Migration from Next.js to Vite**: Ongoing migration with potential issues
2. **Class Component Architecture**: Using class components instead of hooks
3. **Form State Management**: Converting hook-based forms to class-based forms
4. **Authentication Integration**: Ensuring seamless auth flow between frontend and backend
5. **File Upload Handling**: Managing resume uploads and processing

## Technical Debt

1. **Supabase Integration**: Legacy code still references Supabase
2. **Import Statement Issues**: Some files have duplicate or incorrect imports
3. **Next.js Specific Code**: Some components still use Next.js specific features
4. **Inconsistent Component Structure**: Mix of functional and class components
5. **Path Alias Resolution**: Issues with @/ path aliases 