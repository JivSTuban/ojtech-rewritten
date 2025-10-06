# H2 to PostgreSQL Migration Checklist

Use this checklist to track your migration progress. Check off items as you complete them.

---

## 📋 Pre-Migration Preparation

### Local Environment Setup
- [ ] Install PostgreSQL 15+ on local machine
- [ ] Install pgAdmin 4 or another PostgreSQL client
- [ ] Create local database: `ojtech_dev`
- [ ] Verify PostgreSQL is running (port 5432)
- [ ] Test connection with pgAdmin

### Code Preparation
- [ ] Create a new branch: `git checkout -b feature/postgres-migration`
- [ ] Backup current H2 database data (if needed)
- [ ] Review all existing migration files in `db/migration/`
- [ ] Document current database schema

---

## 🔧 Configuration Changes

### Maven Dependencies (pom.xml)
- [ ] Add PostgreSQL driver dependency
- [ ] Add Flyway core dependency
- [ ] Add Flyway PostgreSQL dependency
- [ ] Change H2 scope from `runtime` to `test`
- [ ] Run `mvn clean install` to verify dependencies

### Application Properties
- [ ] Create `application-dev.properties` for local PostgreSQL
- [ ] Create `application-prod.properties` for Render PostgreSQL
- [ ] Update main `application.properties`:
  - [ ] Add `spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}`
  - [ ] Comment out H2-specific settings
  - [ ] Remove `spring.jpa.hibernate.ddl-auto=create`
  - [ ] Add `spring.jpa.hibernate.ddl-auto=validate`
  - [ ] Add Flyway configuration
  - [ ] Change dialect to PostgreSQLDialect

### Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required environment variables
- [ ] Add `.env` to `.gitignore` (verify it's not tracked)

---

## 🗄️ Database Migration Files

### Review Existing Migrations
- [ ] V004__Add_Admin_Job_Management_Tables.sql
- [ ] V5__Add_Generated_Flag_To_CV.sql
- [ ] V6__Add_ParsedResume_To_CV.sql
- [ ] V7__Add_Generated_Flag_To_CV.sql (duplicate?)
- [ ] V8__Add_LastUpdated_To_CV.sql
- [ ] V9__add_github_projects_to_student_profiles.sql
- [ ] V9__Remove_File_Columns_From_CV.sql (duplicate V9?)
- [ ] V10__add_certifications_and_experiences.sql
- [ ] V13__Change_ParsedResume_To_JSONB.sql
- [ ] V20250526_1__Add_HTML_Content_To_CV.sql
- [ ] V20250926_1__Add_Verified_To_Student_Profiles.sql
- [ ] V20250926_2__Consolidate_Onboarding_Flag.sql
- [ ] V20250929_1__Add_PreOJT_Orientation_To_Student_Profiles.sql
- [ ] V20251003_1__Add_Email_Tracking_To_Job_Applications.sql
- [ ] V20251003_2__Update_Bio_Column_To_Text.sql

### Create Missing Migrations
- [ ] **V001__Initial_Schema.sql** - Create all base tables
  - [ ] Users table
  - [ ] Roles table
  - [ ] User_Roles junction table
  - [ ] Jobs table
  - [ ] Job_Applications table
  - [ ] Student_Profiles table
  - [ ] CVs table
  - [ ] Education table
  - [ ] Skills table
  - [ ] Other core tables

- [ ] **V002__Add_Constraints.sql** - Add all foreign keys and constraints
  
- [ ] **V003__Add_Indexes.sql** - Performance indexes
  - [ ] Email indexes
  - [ ] Username indexes
  - [ ] Job status indexes
  - [ ] Application status indexes
  - [ ] Foreign key indexes
  - [ ] Full-text search indexes (optional)

### Fix Migration Issues
- [ ] Resolve duplicate migration versions (V7, V9)
- [ ] Ensure all migrations use PostgreSQL-compatible syntax
- [ ] Check UUID generation (use `gen_random_uuid()`)
- [ ] Verify JSONB usage (not JSON)
- [ ] Check TEXT vs VARCHAR usage
- [ ] Verify timestamp handling

---

## 🧪 Local Testing

### Database Connection
- [ ] Start application with `dev` profile
- [ ] Verify connection to local PostgreSQL
- [ ] Check Flyway migrations execute successfully
- [ ] Verify `flyway_schema_history` table created
- [ ] Check all tables created correctly
- [ ] Verify indexes are in place

### Functionality Testing
- [ ] Test user registration
- [ ] Test user login (JWT)
- [ ] Test Google OAuth login
- [ ] Test GitHub OAuth login
- [ ] Test student profile creation
- [ ] Test CV upload
- [ ] Test job creation
- [ ] Test job application
- [ ] Test email sending
- [ ] Test Cloudinary file upload
- [ ] Test job matching

### Unit Tests
- [ ] Run all existing tests: `mvn test`
- [ ] Fix any failing tests
- [ ] Add new tests for database operations (optional)

---

## ☁️ Render Setup

### Create Render Account
- [ ] Sign up at https://render.com
- [ ] Verify email
- [ ] Connect GitHub account

### PostgreSQL Database
- [ ] Create new PostgreSQL database
  - [ ] Name: `ojtech-db`
  - [ ] Region: Oregon (US West) or closest to users
  - [ ] Plan: Free (for testing) or Starter
- [ ] Save database credentials:
  - [ ] Internal connection string
  - [ ] External connection string
  - [ ] Database name
  - [ ] Username
  - [ ] Password
- [ ] Test connection from local machine (optional)

### Web Service Setup
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure service:
  - [ ] Name: `ojtech-api`
  - [ ] Region: Same as database
  - [ ] Branch: `main` or production branch
  - [ ] Root Directory: `JavaSpringBootOAuth2JwtCrud`
  - [ ] Build Command: `./mvnw clean package -DskipTests`
  - [ ] Start Command: `java -jar target/ojtech-api-0.0.1-SNAPSHOT.jar`
  - [ ] Plan: Free or Starter

### Environment Variables
Add all required environment variables in Render dashboard:

#### Database
- [ ] `DATABASE_URL` (convert from Render's format to JDBC)
- [ ] `DB_USERNAME`
- [ ] `DB_PASSWORD`

#### Application
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `PORT=8081`

#### Security
- [ ] `JWT_SECRET` (generate new random string)
- [ ] `JWT_EXPIRATION=86400000`

#### OAuth2 - Google
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

#### OAuth2 - GitHub
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`

#### External Services
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `GEMINI_API_KEY`

#### Email
- [ ] `EMAIL_USERNAME`
- [ ] `EMAIL_PASSWORD`

#### URLs
- [ ] `FRONTEND_URL` (your frontend domain)
- [ ] `BACKEND_BASE_URL` (https://ojtech-api.onrender.com)

#### Optional
- [ ] `SHOW_SQL=false`

---

## 🔐 OAuth Provider Configuration

### Google Cloud Console
- [ ] Go to https://console.cloud.google.com/apis/credentials
- [ ] Update authorized redirect URIs:
  - [ ] Add: `https://ojtech-api.onrender.com/login/oauth2/code/google`
  - [ ] Keep: `http://localhost:8081/login/oauth2/code/google`
- [ ] Update authorized JavaScript origins:
  - [ ] Add: `https://ojtech-api.onrender.com`

### GitHub OAuth App
- [ ] Go to https://github.com/settings/developers
- [ ] Update Authorization callback URL:
  - [ ] Add: `https://ojtech-api.onrender.com/auth/github/callback`
  - [ ] Or create new OAuth app for production

---

## 🚀 Deployment

### Initial Deployment
- [ ] Commit all changes to Git
- [ ] Push to GitHub
- [ ] Trigger deployment on Render (automatic after setup)
- [ ] Monitor build logs in Render dashboard
- [ ] Watch for Flyway migration execution
- [ ] Wait for "Live" status

### Verification
- [ ] Check deployment logs for errors
- [ ] Verify health endpoint: `https://ojtech-api.onrender.com/actuator/health`
- [ ] Test API documentation: `https://ojtech-api.onrender.com/swagger-ui.html`
- [ ] Check Flyway migration history in database

---

## ✅ Post-Deployment Testing

### API Endpoints
- [ ] Health check: `GET /actuator/health`
- [ ] User registration: `POST /api/auth/signup`
- [ ] User login: `POST /api/auth/login`
- [ ] Get current user: `GET /api/users/me` (with JWT)
- [ ] Google OAuth: Start flow and verify callback
- [ ] GitHub OAuth: Start flow and verify callback

### Database Operations
- [ ] Connect to Render database with pgAdmin
- [ ] Verify all tables exist
- [ ] Check `flyway_schema_history` table
- [ ] Verify sample data (if seeded)
- [ ] Check indexes are created

### Integration Testing
- [ ] Create test user via API
- [ ] Login with test user
- [ ] Create student profile
- [ ] Upload CV
- [ ] Create test job (if employer)
- [ ] Apply to job
- [ ] Verify email sent
- [ ] Test file upload to Cloudinary

---

## 🎨 Frontend Integration

### Update Frontend Configuration
- [ ] Update `apiConfig.ts`:
  ```typescript
  const API_BASE_URL = import.meta.env.PROD 
    ? 'https://ojtech-api.onrender.com'
    : 'http://localhost:8081';
  ```
- [ ] Update OAuth callback URLs in frontend
- [ ] Update CORS allowed origins if needed

### Frontend Deployment
- [ ] Deploy frontend to Vercel/Netlify/Render
- [ ] Set environment variables (API URL)
- [ ] Test production build locally
- [ ] Deploy to production
- [ ] Verify deployment

### End-to-End Testing
- [ ] Register new user from frontend
- [ ] Login with credentials
- [ ] Login with Google
- [ ] Login with GitHub
- [ ] Complete student onboarding
- [ ] Upload resume
- [ ] Browse jobs
- [ ] Apply to job
- [ ] Track applications
- [ ] Test employer flow (if applicable)
- [ ] Test admin flow (if applicable)

---

## 📊 Monitoring & Performance

### Set Up Monitoring
- [ ] Enable Render metrics dashboard
- [ ] Monitor database performance
- [ ] Check memory usage
- [ ] Monitor response times
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### Performance Optimization
- [ ] Review slow query logs
- [ ] Optimize database queries with EXPLAIN
- [ ] Add missing indexes if needed
- [ ] Configure connection pool:
  ```properties
  spring.datasource.hikari.maximum-pool-size=10
  spring.datasource.hikari.minimum-idle=5
  ```
- [ ] Enable query caching if needed

---

## 🔒 Security Hardening

### Security Checklist
- [ ] Generate new JWT secret for production
- [ ] Review CORS configuration
- [ ] Enable HTTPS only (Render does this automatically)
- [ ] Implement rate limiting (optional)
- [ ] Review SQL injection prevention (JPA handles this)
- [ ] Add security headers
- [ ] Review password hashing (BCrypt)
- [ ] Implement request logging
- [ ] Set up error monitoring (Sentry, etc.)

---

## 💾 Backup & Recovery

### Backup Strategy
- [ ] Verify Render automatic backups enabled
- [ ] Test database backup:
  ```bash
  pg_dump [connection-string] > backup.sql
  ```
- [ ] Store backup in external location
- [ ] Document backup schedule
- [ ] Test restore procedure

### Disaster Recovery Plan
- [ ] Document rollback procedure
- [ ] Test database restore from backup
- [ ] Save environment variable configuration
- [ ] Create runbook for common issues

---

## 📝 Documentation

### Update Documentation
- [ ] Update README with deployment instructions
- [ ] Document environment variables
- [ ] Update API documentation
- [ ] Document database schema
- [ ] Create troubleshooting guide
- [ ] Update architecture diagrams

---

## 🎯 Final Verification

### Production Readiness
- [ ] All migrations executed successfully
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation updated

### Go-Live Checklist
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificate valid
- [ ] All stakeholders notified
- [ ] Support team briefed
- [ ] Rollback plan ready
- [ ] Monitoring alerts configured

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Flyway migration fails
- [ ] Check migration file syntax
- [ ] Verify migration version numbers
- [ ] Check for duplicate versions
- [ ] Review flyway_schema_history table

**Issue**: Database connection timeout
- [ ] Verify DATABASE_URL format
- [ ] Check username and password
- [ ] Verify database is running
- [ ] Check Render database status

**Issue**: OAuth not working
- [ ] Verify redirect URLs in provider console
- [ ] Check GOOGLE_CLIENT_ID and SECRET
- [ ] Verify BACKEND_BASE_URL is correct
- [ ] Check CORS configuration

**Issue**: Application crashes on startup
- [ ] Review Render logs
- [ ] Check all environment variables set
- [ ] Verify JAR file builds correctly
- [ ] Check Java version compatibility

---

## 📞 Support Resources

- [ ] Render Documentation: https://render.com/docs
- [ ] PostgreSQL Documentation: https://www.postgresql.org/docs/
- [ ] Flyway Documentation: https://flywaydb.org/documentation/
- [ ] Spring Boot PostgreSQL Guide: https://spring.io/guides/gs/accessing-data-postgresql/

---

## ✨ Success Criteria

You've successfully migrated when:
- ✅ Application runs on Render
- ✅ Database is PostgreSQL (not H2)
- ✅ All migrations executed successfully
- ✅ All features working in production
- ✅ Frontend connected to production API
- ✅ OAuth flows working
- ✅ No critical errors in logs
- ✅ Performance is acceptable
- ✅ Backups configured

---

**Migration Started**: __________
**Migration Completed**: __________
**Deployed By**: __________

---

**Notes & Issues**:
<!-- Add any notes, issues encountered, or deviations from the plan here -->
