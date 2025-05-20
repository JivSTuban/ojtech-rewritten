# OJTech Spring Boot API - Product Requirements Document

## 1. Introduction

### 1.1 Purpose
This document outlines the requirements for developing a Spring Boot API to replace the Supabase implementation currently used in the OJTech application. The new implementation will provide all the same functionality while giving more control over the backend architecture.

### 1.2 Scope
The Spring Boot API will support user authentication, profile management, job posting, job searching, and application features currently implemented in the Supabase-powered system. It will use H2 database for development, PostgreSQL for production, JWT for authentication, and Cloudinary for file storage.

### 1.3 Technical Stack
- **Framework**: Spring Boot 3.1+
- **Database**: H2 (Development), PostgreSQL (Production)
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Build Tool**: Maven
- **Java Version**: 17+
- **Documentation**: Swagger/OpenAPI

## 2. System Architecture

### 2.1 High-Level Architecture
The system follows a standard layered architecture:
- **Controllers**: Handle API requests/responses
- **Services**: Implement business logic
- **Repositories**: Provide data access
- **Security**: JWT-based authentication and authorization
- **File Storage**: Integration with Cloudinary

### 2.2 Database Schema
The schema will include the following main entities:
- Users
- Roles
- Profiles (Student & Employer)
- CVs
- Jobs
- Job Applications

### 2.3 Authentication Flow
1. User registers or logs in
2. Server validates credentials
3. Server generates JWT token
4. Client stores token in localStorage
5. Token is included in subsequent API requests
6. Server validates token on protected endpoints

## 3. Features and Requirements

### 3.1 Authentication System

#### 3.1.1 User Registration
- Allow users to register with email, username, and password
- Support for multiple roles (STUDENT, EMPLOYER, ADMIN)
- Email verification (optional for development)

#### 3.1.2 User Authentication
- JWT-based authentication
- Access token with configurable expiration time
- Secure password storage with BCrypt encryption

#### 3.1.3 Authorization
- Role-based access control
- Endpoint security based on user roles
- Token validation and refresh mechanism

### 3.2 Profile Management

#### 3.2.1 Base Profile Features
- Create and update basic profile information
- Upload and manage profile picture
- Track onboarding completion status

#### 3.2.2 Student Profile Features
- Complete student onboarding with education, skills, and contact details
- Upload, manage, and select active CV
- Store portfolio and professional links (GitHub, LinkedIn)

#### 3.2.3 Employer Profile Features
- Complete employer onboarding with company details
- Upload and manage company logo
- Store company website and description

### 3.3 Job Management System

#### 3.3.1 Job Creation and Management
- Create, update, and delete job postings (employers only)
- Specify job details (title, description, requirements, salary, location)
- Control job visibility (active/inactive)

#### 3.3.2 Job Search and Filtering
- List all active jobs with pagination
- Search jobs by title
- Filter jobs by requirements and location

#### 3.3.3 Job Application System
- Submit job applications with cover letter and CV reference
- Track application status
- Allow employers to update application status

### 3.4 File Management

#### 3.4.1 Student CV Upload
- Upload CV files (PDF, DOC, DOCX)
- Process and store files using Cloudinary
- Select active CV for applications

#### 3.4.2 Profile Images
- Upload and manage profile pictures
- Upload and manage employer company logos
- Image optimization and validation

## 4. API Endpoints

### 4.1 Authentication Endpoints
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Authenticate and get JWT token
- `POST /api/auth/signout`: Invalidate current session
- `GET /api/auth/me`: Get current authenticated user

### 4.2 Profile Endpoints
- `GET /api/profile/me`: Get current user profile
- `POST /api/profile/create`: Create initial profile after registration
- `PUT /api/profile/update`: Update basic profile information
- `POST /api/profile/avatar`: Upload profile avatar
- `GET /api/profile/student/me`: Get student profile
- `POST /api/profile/student/onboarding`: Complete student onboarding
- `POST /api/profile/student/cv`: Upload student CV
- `GET /api/profile/employer/me`: Get employer profile
- `POST /api/profile/employer/onboarding`: Complete employer onboarding
- `POST /api/profile/employer/logo`: Upload employer logo

### 4.3 Job Endpoints
- `GET /api/jobs`: Get all active jobs (paginated)
- `GET /api/jobs/{id}`: Get specific job details
- `GET /api/jobs/search`: Search jobs by title
- `POST /api/jobs`: Create new job (employer only)
- `PUT /api/jobs/{id}`: Update job (employer only)
- `DELETE /api/jobs/{id}`: Delete job (employer only)
- `GET /api/jobs/my-jobs`: Get employer jobs (employer only)
- `GET /api/jobs/my-jobs/{id}`: Get specific employer job (employer only)

### 4.4 Job Application Endpoints
- `POST /api/job-applications/apply`: Apply for job (student only)
- `GET /api/job-applications`: Get student's submitted applications (student only)
- `GET /api/job-applications/{id}`: Get specific application details
- `GET /api/jobs/{jobId}/applications`: Get job applications (employer only)
- `PUT /api/job-applications/{id}/status`: Update application status (employer only)

## 5. Security Implementation

### 5.1 Authentication Security
- JWT tokens with appropriate expiration times
- Secure storage of user credentials
- Protection against common attacks (CSRF, XSS)

### 5.2 Authorization Controls
- Proper role-based access control
- Resource ownership validation
- Field-level security for sensitive data

### 5.3 Data Security
- Secure password storage with BCrypt hashing
- JSON serialization protection (against circular references)
- Input validation and sanitization

## 6. Database Models

### 6.1 User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    @JsonIgnore
    private String password;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonBackReference
    private Profile profile;
    
    private boolean enabled = true;
}
```

### 6.2 Role Entity
```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ERole name;
}

public enum ERole {
    ROLE_STUDENT,
    ROLE_EMPLOYER,
    ROLE_ADMIN
}
```

### 6.3 Profile Entity
```java
@Entity
@Table(name = "profiles")
@Inheritance(strategy = InheritanceType.JOINED)
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonManagedReference
    private User user;
    
    private String fullName;
    private String avatarUrl;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    private boolean hasCompletedOnboarding = false;
}

public enum UserRole {
    STUDENT,
    EMPLOYER,
    ADMIN
}
```

### 6.4 Student Profile Entity
```java
@Entity
@Table(name = "student_profiles")
public class StudentProfile extends Profile {
    private String university;
    private String major;
    private Integer graduationYear;
    private String phoneNumber;
    private String bio;
    
    @ElementCollection
    private List<String> skills = new ArrayList<>();
    
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<CV> cvs = new ArrayList<>();
    
    private UUID activeCvId;
}
```

### 6.5 Employer Profile Entity
```java
@Entity
@Table(name = "employer_profiles")
public class EmployerProfile extends Profile {
    private String companyName;
    private String companySize;
    private String industry;
    private String location;
    private String companyDescription;
    private String websiteUrl;
    private String logoUrl;
    
    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Job> jobs = new ArrayList<>();
}
```

### 6.6 CV Entity
```java
@Entity
@Table(name = "cvs")
public class CV {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonBackReference
    private StudentProfile student;
    
    private String fileName;
    private String fileUrl;
    private String fileType;
    private LocalDateTime uploadDate;
    private boolean isActive;
}
```

### 6.7 Job Entity
```java
@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "employer_id")
    @JsonBackReference
    private EmployerProfile employer;
    
    private String title;
    private String description;
    private String location;
    
    @ElementCollection
    private List<String> requiredSkills = new ArrayList<>();
    
    private String employmentType;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private LocalDateTime postedAt;
    private boolean active = true;
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<JobApplication> applications = new ArrayList<>();
}
```

### 6.8 Job Application Entity
```java
@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "job_id")
    @JsonBackReference
    private Job job;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonBackReference
    private StudentProfile student;
    
    @ManyToOne
    @JoinColumn(name = "cv_id")
    private CV cv;
    
    private String coverLetter;
    
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    private LocalDateTime appliedAt;
    private LocalDateTime lastUpdatedAt;
}

public enum ApplicationStatus {
    PENDING,
    REVIEWED,
    INTERVIEW,
    REJECTED,
    ACCEPTED
}
```

## 7. Implementation Plan

### 7.1 Phase 1: Core Setup (Week 1)
- Set up Spring Boot project with required dependencies
- Configure H2 database and JPA
- Implement entity models
- Set up security configuration and JWT authentication

### 7.2 Phase 2: Authentication System (Week 2)
- Implement User and Role repositories
- Create authentication service and controller
- Set up JWT token generation and validation
- Test user registration and login endpoints

### 7.3 Phase 3: Profile Management (Week 3)
- Implement Profile models and repositories
- Create profile service and controller
- Set up Cloudinary integration for file uploads
- Test profile creation, update, and retrieval endpoints

### 7.4 Phase 4: Job System (Week 4)
- Implement Job and JobApplication models and repositories
- Create job service and controller
- Test job creation, update, deletion, and search endpoints
- Implement job application system

### 7.5 Phase 5: Testing and Refinement (Week 5)
- Comprehensive API testing
- Security review and enhancements
- Performance optimization
- Documentation creation

## 8. Integration and Testing

### 8.1 Testing Strategy
- Unit tests for all service methods
- Integration tests for API endpoints
- Security testing for authentication and authorization
- Performance testing for database operations

### 8.2 Integration with Frontend
- Update frontend API client to use new endpoints
- Ensure API responses match current Supabase structure
- Test all features end-to-end

## 9. Deployment and Operations

### 9.1 Deployment Process
- Build with Maven
- Package as Docker container (optional)
- Deploy to production server

### 9.2 Operations Considerations
- Logging and monitoring setup
- Database backup and recovery plan
- CI/CD pipeline for automated deployment

## 10. Documentation

### 10.1 API Documentation
- Implement Swagger/OpenAPI for automatic API documentation
- Document each endpoint with sample requests and responses
- Provide authentication details and error handling information

### 10.2 Developer Documentation
- Setup guide for developers
- Database schema documentation
- Architecture overview

## 11. References

1. [Current Supabase Project](https://app.supabase.com/project/npjouqmhncfjylnldixa)
2. [Spring Security with JWT Implementation](https://www.bezkoder.com/spring-boot-jwt-authentication/)
3. [Spring Boot File Upload/Download](https://www.callicoder.com/spring-boot-file-upload-download-rest-api-example/)
4. [Cloudinary Java Integration](https://cloudinary.com/documentation/java_integration)
5. [Spring Data JPA Tutorial](https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa)

## 12. Appendix

### 12.1 Dependencies
```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- H2 Database (for development) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- PostgreSQL (for production) -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- JWT Authentication -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Cloudinary for file storage -->
    <dependency>
        <groupId>com.cloudinary</groupId>
        <artifactId>cloudinary-http44</artifactId>
        <version>1.34.0</version>
    </dependency>
    <!-- Swagger/OpenAPI Documentation -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.1.0</version>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 12.2 Application Properties
```properties
# Server Configuration
server.port=8080

# H2 Database Configuration (Development)
spring.datasource.url=jdbc:h2:mem:ojtech
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# PostgreSQL Configuration (Production)
# Uncomment these for production
#spring.datasource.url=jdbc:postgresql://localhost:5432/ojtech
#spring.datasource.username=postgres
#spring.datasource.password=password
#spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
app.jwt.secret=YourSecretKeyHereItShouldBeVeryLongAtLeast256BitsRecommendedForProduction
app.jwt.expiration=86400000
app.jwt.header=Authorization
app.jwt.prefix=Bearer 

# Cloudinary Configuration
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret

# File size limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Enable API docs
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### 12.3 Jackson Configuration for Circular References
```java
@Configuration
public class JacksonConfig {
    @Bean
    public Module hibernateModule() {
        return new Hibernate5JakartaModule();
    }
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.registerModule(hibernateModule());
        
        // Handle circular references
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        
        return objectMapper;
    }
}
```
