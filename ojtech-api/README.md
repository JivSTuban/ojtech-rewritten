# OJTech API

## Overview

This Spring Boot API provides backend services for the OJTech job matching platform. The API has been migrated from a Supabase backend to a full Spring Boot implementation.

## Features

- User profile management for students, employers, and administrators
- Resume/CV upload, parsing, and analysis
- Job posting management
- Intelligent job matching algorithm
- Job application tracking
- Skills assessment

## Tech Stack

- Java 17
- Spring Boot 3.4.5
- Spring Data JPA
- Spring Security
- H2 Database (for development)
- Swagger/OpenAPI for API documentation

## API Documentation

API documentation is available via Swagger UI at: `http://localhost:8080/swagger-ui.html`

## Project Structure

The project follows a standard Spring Boot architecture:

- `model` - Entity classes mapped to database tables
- `repository` - Data access layer
- `service` - Business logic layer
- `controller` - REST API endpoints

## Primary Entities

- **Profile**: Base user information
- **StudentProfile**: Student-specific profile details
- **Employer**: Employer organization information
- **Job**: Job postings
- **CV**: Resume data, including extracted skills and analysis
- **Match**: Job matches between students and job postings
- **JobApplication**: Applications submitted by students for jobs
- **SkillAssessment**: Student self-assessment of skills

## Key Endpoints

- `/api/profiles` - User profile management
- `/api/student-profiles` - Student profile management
- `/api/employers` - Employer management
- `/api/jobs` - Job posting management
- `/api/cvs` - Resume upload and management
- `/api/job-matching` - Job matching functionality
- `/api/job-applications` - Job application management
- `/api/skills` - Skill assessment management

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven

### Running the Application

1. Clone the repository
2. Navigate to the project directory
3. Run the application:
   ```
   mvn spring-boot:run
   ```
4. Access the API at `http://localhost:8080`
5. Access the Swagger UI at `http://localhost:8080/swagger-ui.html`

## Database

The application uses H2 in-memory database by default for development. The console is available at `http://localhost:8080/h2-console` with the following credentials:

- JDBC URL: `jdbc:h2:mem:ojtech`
- Username: `sa`
- Password: `password`

For production deployment, configure an appropriate database in `application.properties`.

## Security

The API is secured using Spring Security with JWT authentication. Protected endpoints require a valid JWT token to be included in the Authorization header.

## Job Matching Algorithm

The platform features a sophisticated job matching algorithm that:

1. Extracts skills from student resumes
2. Compares them with required and preferred skills for jobs
3. Calculates match scores based on skill overlap
4. Presents the most suitable job opportunities to students

## License

This project is proprietary software owned by OJTech. 