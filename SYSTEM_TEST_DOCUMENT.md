# OJTech System Test Document (STD)

## Change History

| Version | Date       | Author          | Changes                                    |
|---------|------------|------------------|--------------------------------------------|
| 1.0     | 2025-09-20 | System Analyst  | Initial STD creation based on project scan |

## Table of Contents

- [Change History](#change-history)
- [Table of Contents](#table-of-contents)
- [1. Introduction](#1-introduction)
  - [1.1. System Overview](#11-system-overview)
  - [1.2. Test Approach](#12-test-approach)
  - [1.3. Definitions and Acronyms](#13-definitions-and-acronyms)
- [2. Test Plan](#2-test-plan)
  - [2.1. Features to be Tested](#21-features-to-be-tested)
  - [2.2. Features not to be Tested](#22-features-not-to-be-tested)
  - [2.3. Testing Tools and Environment](#23-testing-tools-and-environment)
- [3. Test Cases](#3-test-cases)
  - [3.1. Authentication System Tests](#31-authentication-system-tests)
  - [3.2. User Management Tests](#32-user-management-tests)
  - [3.3. Job Management Tests](#33-job-management-tests)
  - [3.4. Application Process Tests](#34-application-process-tests)
  - [3.5. Resume Management Tests](#35-resume-management-tests)
  - [3.6. Job Matching Tests](#36-job-matching-tests)
  - [3.7. Profile Management Tests](#37-profile-management-tests)
  - [3.8. Onboarding Flow Tests](#38-onboarding-flow-tests)
  - [3.9. Admin Dashboard Tests](#39-admin-dashboard-tests)
  - [3.10. Email Integration Tests](#310-email-integration-tests)
  - [3.11. Database Migration Tests](#311-database-migration-tests)
- [Appendix (Test Logs)](#appendix-test-logs)
  - [A.1. Log for Test Execution](#a1-log-for-test-execution)
  - [A.2. Test Results](#a2-test-results)
  - [A.3. Incident Report](#a3-incident-report)

## 1. Introduction

### 1.1. System Overview

OJTech is a comprehensive job platform designed to connect students with employment opportunities. The system consists of:

- **Frontend Application**: React-based SPA built with Vite, TypeScript, and Tailwind CSS
- **Backend API**: Spring Boot 3.2.3 application with JWT authentication and OAuth2 integration
- **Database**: H2 Database (development), PostgreSQL (production) with JPA integration
- **File Storage**: Cloudinary integration for resume and document management
- **Authentication**: JWT tokens with OAuth2 (Google) social login support

**Key Stakeholders**:
- Students seeking job opportunities
- Employers posting job listings
- System administrators managing the platform

### 1.2. Test Approach

This System Test Document follows a comprehensive testing strategy covering:

1. **Functional Testing**: Verification of all system features and business logic
2. **Integration Testing**: Testing interactions between frontend, backend, and external services
3. **Security Testing**: Authentication, authorization, and data protection validation
4. **Performance Testing**: System responsiveness and scalability assessment
5. **Usability Testing**: User experience and interface validation
6. **API Testing**: RESTful endpoint functionality and data integrity

### 1.3. Definitions and Acronyms

| Term | Definition |
|------|------------|
| API | Application Programming Interface |
| CV | Curriculum Vitae |
| JWT | JSON Web Token |
| OAuth2 | Open Authorization 2.0 |
| SPA | Single Page Application |
| STD | System Test Document |
| UI/UX | User Interface/User Experience |
| REST | Representational State Transfer |
| JPA | Java Persistence API |
| ORM | Object-Relational Mapping |

## 2. Test Plan

### 2.1. Features to be Tested

#### Core System Features
1. **Authentication & Authorization**
   - User registration and login
   - JWT token management
   - OAuth2 Google integration
   - Role-based access control (Student, Employer, Admin)
   - Password reset functionality

2. **User Profile Management**
   - Student profile creation and editing
   - Employer profile management
   - Profile photo upload via Cloudinary
   - Contact information management

3. **Job Management System**
   - Job posting creation (Employers)
   - Job listing display and search
   - Job detail viewing
   - Job application submission
   - Application status tracking

4. **Resume/CV Management**
   - CV creation and editing
   - Multiple CV templates support
   - PDF generation functionality
   - Resume upload and storage
   - Dynamic CV sections

5. **Job Matching Algorithm**
   - Skill-based matching
   - Experience level compatibility
   - Location preferences
   - Match score calculation
   - Swipe-based job discovery

6. **Onboarding Processes**
   - Student onboarding flow
   - Employer onboarding flow
   - Profile completion tracking
   - Guided setup experience

7. **Application Tracking**
   - Application submission tracking
   - Status updates and notifications
   - Application history management
   - Employer application review

8. **Admin Functions**
   - User management dashboard
   - System analytics and reporting
   - Content moderation
   - Platform administration

9. **Email Integration**
   - Email notifications
   - Application confirmations
   - System alerts
   - Communication management

### 2.2. Features not to be Tested

1. **Third-Party Service Dependencies**
   - Google OAuth provider internal functionality
   - Cloudinary service reliability
   - Email service provider operations

2. **Infrastructure Components**
   - Database server performance optimization
   - Web server configuration
   - CDN performance

3. **Browser Compatibility**
   - Legacy browser support (IE, older versions)
   - Mobile browser variations

4. **Load Testing**
   - High-volume concurrent user testing
   - Stress testing beyond normal usage

### 2.3. Testing Tools and Environment

#### Backend Testing Stack
- **Framework**: Spring Boot Test with JUnit 5
- **Mocking**: Mockito 5.7.0
- **Web Testing**: MockMvc for API endpoint testing
- **Database**: H2 in-memory database for testing, PostgreSQL for integration testing
- **Security Testing**: Spring Security Test

#### Frontend Testing Stack
- **Build Tool**: Vite 5.1.0 (testing framework support available)
- **Browser Testing**: Manual testing across modern browsers
- **Component Testing**: React Testing Library (to be implemented)
- **End-to-End Testing**: Cypress/Playwright (recommended for future implementation)

#### Development Environment
- **Java Version**: 17
- **Node.js Version**: Latest LTS
- **Database**: H2 Database (development), PostgreSQL (production)
- **IDE**: IntelliJ IDEA / VS Code
- **Version Control**: Git

#### Test Data Management
- **Database Seeding**: Automated test data creation
- **Mock Data**: Realistic test datasets for various scenarios
- **Clean State**: Database reset between test suites

## 3. Test Cases

### 3.1. Authentication System Tests

#### 3.1.1. User Registration Test
**Purpose**: Verify that new users can successfully register for the platform

**Inputs**:
- Valid email address
- Unique username
- Strong password
- User role selection (Student/Employer)

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: User account created successfully, confirmation email sent, user redirected to onboarding
- **Fail**: Registration fails, appropriate error messages displayed

**Test Procedure**:
1. Navigate to registration page
2. Fill out registration form with valid data
3. Submit form
4. Verify account creation in database
5. Check email notification sent
6. Confirm redirect to appropriate onboarding flow

#### 3.1.2. User Login Test
**Purpose**: Verify authenticated access to the platform

**Inputs**:
- Registered email/username
- Correct password

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Successful login, JWT token generated, user redirected to dashboard
- **Fail**: Login rejected, error message displayed

**Test Procedure**:
1. Navigate to login page
2. Enter valid credentials
3. Submit login form
4. Verify JWT token generation
5. Confirm successful redirect to user dashboard
6. Validate session persistence

#### 3.1.3. OAuth2 Google Login Test
**Purpose**: Verify Google OAuth integration functionality

**Inputs**:
- Valid Google account credentials
- OAuth2 consent

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Successful authentication via Google, user profile created/updated
- **Fail**: OAuth flow fails, user not authenticated

**Test Procedure**:
1. Click "Sign in with Google" button
2. Complete Google authentication flow
3. Grant application permissions
4. Verify user profile creation/update
5. Confirm successful platform access

### 3.2. User Management Tests

#### 3.2.1. Profile Creation Test
**Purpose**: Verify user profile creation and data persistence

**Inputs**:
- Personal information (name, contact details)
- Professional information (skills, experience)
- Profile photo upload

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Profile saved successfully, data retrievable, photo uploaded to Cloudinary
- **Fail**: Profile save fails, data inconsistency, upload errors

**Test Procedure**:
1. Access profile creation page
2. Fill all required fields
3. Upload profile photo
4. Submit profile data
5. Verify data persistence in database
6. Confirm photo storage in Cloudinary
7. Test profile data retrieval

#### 3.2.2. Profile Update Test
**Purpose**: Verify user profile modification functionality

**Inputs**:
- Updated personal information
- Modified professional details
- New profile photo

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Changes saved successfully, previous data replaced
- **Fail**: Update fails, data corruption, inconsistent state

**Test Procedure**:
1. Login to existing account
2. Navigate to profile edit page
3. Modify various profile fields
4. Submit changes
5. Verify updates in database
6. Confirm UI reflects changes
7. Test data integrity

### 3.3. Job Management Tests

#### 3.3.1. Job Posting Creation Test
**Purpose**: Verify employers can create job postings

**Inputs**:
- Job title and description
- Required skills and qualifications
- Compensation details
- Location and work type

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Job posting created, visible in listings, searchable
- **Fail**: Creation fails, posting not saved, validation errors

**Test Procedure**:
1. Login as employer user
2. Navigate to job creation page
3. Fill job posting form
4. Submit job posting
5. Verify posting in database
6. Confirm visibility in job listings
7. Test job search functionality

#### 3.3.2. Job Search and Filter Test
**Purpose**: Verify job search and filtering functionality

**Inputs**:
- Search keywords
- Location filters
- Job type filters
- Experience level filters

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Relevant results returned, filters applied correctly
- **Fail**: Incorrect results, filters not working, search errors

**Test Procedure**:
1. Access job listings page
2. Enter search criteria
3. Apply various filters
4. Submit search
5. Verify result relevance
6. Test filter combinations
7. Validate search performance

### 3.4. Application Process Tests

#### 3.4.1. Job Application Submission Test
**Purpose**: Verify students can apply for jobs

**Inputs**:
- Selected job posting
- Application cover letter
- Resume selection
- Additional documents

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Application submitted, confirmation sent, status trackable
- **Fail**: Submission fails, documents not attached, no confirmation

**Test Procedure**:
1. Login as student user
2. Browse and select job posting
3. Click "Apply Now" button
4. Fill application form
5. Attach resume and documents
6. Submit application
7. Verify application in database
8. Check confirmation email
9. Test application tracking

#### 3.4.2. Application Status Management Test
**Purpose**: Verify application status tracking for all parties

**Inputs**:
- Submitted job application
- Status update by employer
- Notification preferences

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Status updates reflected, notifications sent, history maintained
- **Fail**: Status not updated, notifications failed, inconsistent data

**Test Procedure**:
1. Submit job application (student)
2. Login as employer
3. Review application
4. Update application status
5. Verify status change in system
6. Check student notifications
7. Test status history tracking

### 3.5. Resume Management Tests

#### 3.5.1. Resume Creation Test
**Purpose**: Verify resume creation and template functionality

**Inputs**:
- Personal information
- Education details
- Work experience
- Skills and achievements
- Template selection

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Resume created, template applied, PDF generated
- **Fail**: Creation fails, template errors, PDF generation issues

**Test Procedure**:
1. Login as student user
2. Access resume builder
3. Select resume template
4. Fill resume sections
5. Preview resume
6. Generate PDF
7. Save resume
8. Verify data persistence
9. Test PDF download

#### 3.5.2. Multiple Resume Management Test
**Purpose**: Verify multiple resume support functionality

**Inputs**:
- Multiple resume versions
- Different templates
- Version naming
- Default resume selection

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Multiple resumes stored, templates applied, proper versioning
- **Fail**: Conflicts between resumes, template issues, data loss

**Test Procedure**:
1. Create first resume
2. Create second resume with different template
3. Name both resumes appropriately
4. Set default resume
5. Verify both stored correctly
6. Test resume switching
7. Confirm template differences
8. Validate default selection

### 3.6. Job Matching Tests

#### 3.6.1. Skill Matching Algorithm Test
**Purpose**: Verify job matching based on skills and qualifications

**Inputs**:
- Student skill profile
- Job skill requirements
- Experience levels
- Matching algorithm parameters

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Accurate match scores calculated, relevant jobs recommended
- **Fail**: Incorrect matching, irrelevant recommendations, algorithm errors

**Test Procedure**:
1. Create student profile with specific skills
2. Create job postings with matching/non-matching requirements
3. Run matching algorithm
4. Verify match score calculations
5. Check job recommendations
6. Test edge cases (no matches, perfect matches)
7. Validate scoring accuracy

#### 3.6.2. Swipe Interface Test
**Purpose**: Verify swipe-based job discovery functionality

**Inputs**:
- Job recommendations
- Swipe gestures (left/right)
- Matching preferences
- Application triggers

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Smooth swipe interactions, correct job cycling, proper application flow
- **Fail**: Swipe issues, incorrect job sequence, application errors

**Test Procedure**:
1. Login as student with completed profile
2. Access opportunities page
3. Test right swipe (interested)
4. Test left swipe (not interested)
5. Verify application process on right swipe
6. Check job cycling functionality
7. Test swipe performance and responsiveness

### 3.7. Profile Management Tests

#### 3.7.1. Student Profile Onboarding Test
**Purpose**: Verify comprehensive student onboarding process

**Inputs**:
- Personal information
- Educational background
- Skills assessment
- Career preferences
- GitHub integration
- Portfolio projects

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Complete profile created, all sections filled, ready for job matching
- **Fail**: Incomplete onboarding, missing data, integration failures

**Test Procedure**:
1. Complete user registration
2. Start student onboarding flow
3. Fill personal information step
4. Complete education details step
5. Perform skills assessment
6. Set career preferences
7. Connect GitHub account
8. Add portfolio projects
9. Complete onboarding
10. Verify profile completeness
11. Test job matching activation

#### 3.7.2. Employer Profile Setup Test
**Purpose**: Verify employer profile creation and company setup

**Inputs**:
- Company information
- Contact details
- Company culture description
- Hiring preferences
- Job posting permissions

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Employer profile created, company verified, job posting enabled
- **Fail**: Profile incomplete, verification issues, restricted access

**Test Procedure**:
1. Register as employer user
2. Start employer onboarding
3. Fill company information
4. Add contact details
5. Describe company culture
6. Set hiring preferences
7. Complete verification process
8. Test job posting access
9. Verify profile visibility

### 3.8. Onboarding Flow Tests

#### 3.8.1. Multi-Step Onboarding Navigation Test
**Purpose**: Verify onboarding flow navigation and data persistence

**Inputs**:
- Partial form completion
- Navigation between steps
- Form validation
- Data preservation

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Smooth navigation, data preserved between steps, validation working
- **Fail**: Navigation issues, data loss, validation errors

**Test Procedure**:
1. Start onboarding process
2. Partially complete step 1
3. Navigate to step 2
4. Return to step 1
5. Verify data preservation
6. Test form validation
7. Complete all steps
8. Verify final data integrity

#### 3.8.2. Onboarding Completion Tracking Test
**Purpose**: Verify onboarding progress tracking and completion status

**Inputs**:
- Onboarding steps completion
- Progress indicators
- Skip options
- Completion validation

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Progress tracked accurately, completion status updated, user access granted
- **Fail**: Progress not tracked, incomplete validation, access issues

**Test Procedure**:
1. Monitor onboarding progress indicators
2. Complete steps in sequence
3. Test skip functionality where available
4. Verify progress updates
5. Complete final step
6. Check completion status
7. Validate full platform access

### 3.9. Admin Dashboard Tests

#### 3.9.1. User Management Test
**Purpose**: Verify admin user management capabilities

**Inputs**:
- Admin credentials
- User account modifications
- Role assignments
- Account status changes

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Admin can view, modify, and manage user accounts
- **Fail**: Access denied, modification failures, inconsistent data

**Test Procedure**:
1. Login as admin user
2. Access user management dashboard
3. View user list
4. Edit user profile
5. Change user role
6. Activate/deactivate account
7. Verify changes applied
8. Test user access after changes

#### 3.9.2. System Analytics Test
**Purpose**: Verify admin dashboard analytics and reporting

**Inputs**:
- System usage data
- User activity metrics
- Job posting statistics
- Application analytics

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Accurate analytics displayed, data properly aggregated, reports functional
- **Fail**: Incorrect data, calculation errors, report failures

**Test Procedure**:
1. Access admin dashboard
2. View system overview
3. Check user metrics
4. Review job statistics
5. Analyze application data
6. Generate reports
7. Verify data accuracy
8. Test data export functionality

### 3.10. Email Integration Tests

#### 3.10.1. Registration Email Test
**Purpose**: Verify email notifications for user registration

**Inputs**:
- New user registration
- Email configuration
- Template content
- Delivery settings

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Welcome email sent, proper content, deliverable
- **Fail**: Email not sent, content errors, delivery failures

**Test Procedure**:
1. Complete user registration
2. Check email delivery
3. Verify email content
4. Test embedded links
5. Validate email format
6. Confirm sender information

#### 3.10.2. Application Notification Test
**Purpose**: Verify email notifications for job applications

**Inputs**:
- Job application submission
- Notification preferences
- Email templates
- Recipient settings

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Appropriate parties notified, correct content, timely delivery
- **Fail**: Notifications not sent, wrong recipients, content errors

**Test Procedure**:
1. Submit job application
2. Verify student confirmation email
3. Check employer notification
4. Validate email content
5. Test response mechanisms
6. Confirm notification preferences respected

### 3.11. Database Migration Tests

#### 3.11.1. H2 to PostgreSQL Migration Test
**Purpose**: Verify seamless database migration from H2 (development) to PostgreSQL (production)

**Inputs**:
- Existing H2 database with test data
- PostgreSQL database setup
- Migration scripts
- Data validation queries

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: All data migrated successfully, no data loss, application functions correctly with PostgreSQL
- **Fail**: Data loss during migration, application errors, performance issues

**Test Procedure**:
1. Backup existing H2 database data
2. Set up PostgreSQL database instance
3. Run database migration scripts
4. Verify data integrity post-migration
5. Test all CRUD operations
6. Validate foreign key relationships
7. Check application performance
8. Verify all existing functionality works

#### 3.11.2. PostgreSQL Performance Test
**Purpose**: Verify application performance with PostgreSQL in production environment

**Inputs**:
- PostgreSQL database configuration
- Production-level data volume
- Concurrent user simulation
- Performance benchmarks

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Response times within acceptable limits, no performance degradation
- **Fail**: Slow queries, timeout errors, degraded user experience

**Test Procedure**:
1. Configure PostgreSQL with production settings
2. Load representative data volume
3. Execute common query patterns
4. Measure response times
5. Test concurrent user scenarios
6. Monitor database performance metrics
7. Compare with H2 baseline performance
8. Optimize queries if needed

#### 3.11.3. Database Configuration Test
**Purpose**: Verify proper database configuration for different environments

**Inputs**:
- Development configuration (H2)
- Production configuration (PostgreSQL)
- Environment-specific settings
- Connection pool settings

**Expected Outputs & Pass/Fail Criteria**:
- **Pass**: Correct database selected per environment, proper connection pooling
- **Fail**: Wrong database used, connection issues, configuration errors

**Test Procedure**:
1. Test development environment with H2
2. Test production environment with PostgreSQL
3. Verify connection pool configuration
4. Test database connection recovery
5. Validate environment variable usage
6. Check connection timeout settings
7. Test failover scenarios
8. Verify configuration security

## Appendix (Test Logs)

### A.1. Log for Test Execution

**Test Execution Template**:
```
Test Case ID: [TC-XXX]
Test Name: [Test Case Name]
Execution Date: [YYYY-MM-DD]
Tester: [Tester Name]
Environment: [Test Environment]
Browser/Version: [Browser Details]
Test Data Used: [Test Data Reference]

Execution Steps:
1. [Step 1 executed]
2. [Step 2 executed]
...

Actual Results:
[Detailed actual results]

Status: [PASS/FAIL/BLOCKED]
Comments: [Additional observations]
Screenshots: [If applicable]
```

### A.2. Test Results

**Test Results Summary Template**:
```
Test Suite: [Suite Name]
Total Test Cases: [Number]
Passed: [Number]
Failed: [Number]
Blocked: [Number]
Not Executed: [Number]

Pass Rate: [Percentage]
Execution Date: [Date Range]
Environment: [Test Environment]

Critical Issues: [Count]
Major Issues: [Count]
Minor Issues: [Count]

Overall Status: [READY FOR RELEASE/NEEDS FIXES/BLOCKED]
```

### A.3. Incident Report

**Incident Report Template**:
```
Incident ID: [INC-XXX]
Date Reported: [YYYY-MM-DD]
Reported By: [Name]
Test Case: [Related Test Case]

Severity: [Critical/Major/Minor]
Priority: [High/Medium/Low]

Summary: [Brief description]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
...

Expected Result: [What should happen]
Actual Result: [What actually happened]

Environment Details:
- Browser: [Browser and version]
- OS: [Operating System]
- Database: [H2/PostgreSQL version]
- Backend Version: [API version]

Attachments: [Screenshots, logs, etc.]

Status: [Open/In Progress/Resolved/Closed]
Assigned To: [Developer name]
Resolution: [How it was fixed]
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-09-20  
**Next Review Date**: 2025-10-20  
**Document Owner**: System Test Team  
**Approval**: [To be filled during review process]
