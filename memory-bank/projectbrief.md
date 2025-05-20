# OJTech Project Brief

## Overview

OJTech is a job matching platform designed to connect students with employers for job opportunities. The platform features intelligent job matching algorithms, resume parsing, and comprehensive profile management for both students and employers.

## Core Components

1. **Spring Boot API Backend**
   - RESTful API providing all backend services
   - JWT-based authentication and authorization
   - Data persistence with JPA/Hibernate
   - Swagger/OpenAPI documentation

2. **React Vite Frontend**
   - Migrated from Next.js to React Vite
   - Class component architecture
   - React Router for client-side routing
   - Tailwind CSS for styling

## Project Goals

1. Complete the migration from Next.js to React Vite
2. Ensure seamless integration between the frontend and Spring Boot backend
3. Implement all core features:
   - User authentication and profile management
   - Resume upload and parsing
   - Job posting and application management
   - Intelligent job matching

## Key Entities

- **User/Profile**: Base user information and authentication
- **StudentProfile**: Student-specific profile details
- **EmployerProfile**: Employer organization information
- **Job**: Job postings with detailed requirements
- **CV**: Resume data with extracted skills
- **Match**: Job matches between students and job postings
- **JobApplication**: Applications submitted by students
- **SkillAssessment**: Student skill self-assessment

## Technical Requirements

1. Backend:
   - Java 17
   - Spring Boot 3.2.3
   - Spring Security with JWT
   - JPA/Hibernate for data persistence
   - H2 Database (dev) / PostgreSQL (prod)

2. Frontend:
   - React 18.2.0
   - TypeScript 5.2.2
   - Vite 5.1.0
   - React Router 6.22.2
   - Tailwind CSS 3.4.0
   - Axios for API requests

## Current Status

The project is in active development with ongoing migration from Next.js to React Vite. The Spring Boot backend is mostly complete, while the frontend migration is in progress with some components and pages already migrated.

## Repository Structure

- `JavaSpringBootOAuth2JwtCrud/`: Spring Boot backend
- `ojtech-vite/`: React Vite frontend
- `memory-bank/`: Project documentation 