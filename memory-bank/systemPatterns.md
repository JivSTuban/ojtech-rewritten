# OJTech System Patterns

## Architecture Overview

OJTech follows a client-server architecture with a clear separation between the frontend and backend:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Vite     │ <──> │  Spring Boot    │ <──> │  Database       │
│  Frontend       │      │  Backend API    │      │  (H2/Postgres)  │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Backend Architecture

The Spring Boot backend follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                       Controller Layer                          │
│  (REST endpoints, request/response handling, input validation)  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        Service Layer                            │
│     (Business logic, transaction management, validation)        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      Repository Layer                           │
│            (Data access, ORM mapping, queries)                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                       Database Layer                            │
│                 (H2 for dev, PostgreSQL for prod)               │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

The React Vite frontend follows a component-based architecture with class components:

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Component                           │
│              (Routes, global state, providers)                  │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
┌───────────────▼───────────────┐   ┌─────────────▼───────────────┐
│        Page Components        │   │       Shared Components     │
│  (Route-specific containers)  │   │  (Reusable UI components)   │
└───────────────┬───────────────┘   └─────────────────────────────┘
                │
┌───────────────▼───────────────┐
│     Feature Components        │
│  (Domain-specific components) │
└─────────────────────────────────┘
```

## Key Design Patterns

### Backend Patterns

1. **Repository Pattern**
   - Each entity has a dedicated repository interface extending JpaRepository
   - Custom query methods follow Spring Data naming conventions

2. **Service Layer Pattern**
   - Business logic encapsulated in service classes
   - Services are injected with repositories and other dependencies
   - Transaction management handled at service level

3. **DTO Pattern**
   - Request/response objects separate from domain entities
   - Prevents exposing internal model details to clients
   - Enables versioning and validation

4. **Exception Handling Pattern**
   - Global exception handler for consistent error responses
   - Custom exceptions for domain-specific errors
   - Structured error responses with codes and messages

### Frontend Patterns

1. **Class Component Pattern**
   - Components implemented as ES6 classes extending React.Component
   - State and props explicitly typed with TypeScript interfaces
   - Lifecycle methods used for side effects

2. **Provider Pattern**
   - Context providers for global state (auth, theme, toast)
   - Consumers access context through higher-order components

3. **Container/Presentational Pattern**
   - Container components handle data fetching and state
   - Presentational components focus on rendering UI

4. **Route Protection Pattern**
   - HOC pattern for protected routes
   - Role-based access control for different user types

## Data Flow

1. **Authentication Flow**
   - User submits credentials
   - Backend validates and issues JWT token
   - Token stored in frontend and included in subsequent requests
   - Protected routes check token validity

2. **Job Matching Flow**
   - Student uploads resume
   - Backend extracts skills and creates profile
   - Matching algorithm compares skills with job requirements
   - Matched jobs presented to student

3. **Application Flow**
   - Student applies for job
   - Application stored in database
   - Employer notified of new application
   - Student can track application status

## Integration Points

1. **API Integration**
   - REST API endpoints for all operations
   - JWT authentication for secure access
   - JSON request/response format

2. **File Upload Integration**
   - Resume/CV upload using multipart form data
   - Cloudinary integration for file storage

3. **External Service Integration**
   - Potential integration with email services
   - Future integration with educational platforms

## Coding Conventions

### Backend Conventions

- Package structure follows domain-driven design
- Class naming follows standard Java conventions
- RESTful API endpoint naming follows resource-based pattern

### Frontend Conventions

- Component files use PascalCase
- Class components with explicit TypeScript interfaces
- CSS using Tailwind utility classes
- File structure organized by feature/domain 