# H2 to PostgreSQL Migration & Render Deployment Plan

## Overview
This plan outlines the migration from H2 in-memory database to PostgreSQL on Render, and deployment of the Spring Boot backend to Render.

---

## Phase 1: Local PostgreSQL Setup & Testing (Days 1-2)

### 1.1 Install PostgreSQL Locally
- [ ] Download and install PostgreSQL 15+ for Windows
- [ ] Install pgAdmin 4 for database management
- [ ] Create local database: `ojtech_dev`
- [ ] Create database user with appropriate permissions

### 1.2 Update Maven Dependencies
**File: `JavaSpringBootOAuth2JwtCrud/pom.xml`**

Add PostgreSQL driver:
```xml
<!-- PostgreSQL Database -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Flyway for database migrations -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Keep H2 for testing:
```xml
<!-- H2 Database (for testing only) -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

### 1.3 Create Application Properties Profiles
**File: `JavaSpringBootOAuth2JwtCrud/src/main/resources/application.properties`**

Create three property files:
1. `application.properties` - Common properties
2. `application-dev.properties` - Local PostgreSQL
3. `application-prod.properties` - Render PostgreSQL

### 1.4 Update Migration Files
Review and update all migration files in `src/main/resources/db/migration/`:
- [ ] Ensure all files follow naming convention: `V{version}__{description}.sql`
- [ ] Verify PostgreSQL-specific syntax (UUID, JSONB, gen_random_uuid(), etc.)
- [ ] Create initial schema migration if missing (V001__Initial_Schema.sql)
- [ ] Add indexes for performance optimization
- [ ] Review foreign key constraints

### 1.5 Configure Flyway
**In `application.properties`:**
```properties
# Flyway Configuration
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-on-migrate=true
```

### 1.6 Update JPA Configuration
**In `application-dev.properties` and `application-prod.properties`:**
```properties
# Change from create to validate (let Flyway handle schema)
spring.jpa.hibernate.ddl-auto=validate

# PostgreSQL dialect
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### 1.7 Test Local Migration
- [ ] Start PostgreSQL locally
- [ ] Run Spring Boot application with `dev` profile
- [ ] Verify all migrations execute successfully
- [ ] Test CRUD operations for all entities
- [ ] Verify OAuth2 login flow
- [ ] Test file uploads to Cloudinary
- [ ] Run existing test suite

---

## Phase 2: Database Schema Review & Optimization (Days 3-4)

### 2.1 Review Entity Classes
Check all JPA entities for PostgreSQL compatibility:
- [ ] UUID generation strategy
- [ ] Column types (especially for H2-specific types)
- [ ] JSON/JSONB fields mapping
- [ ] Timestamp/Date handling
- [ ] Text vs VARCHAR length constraints

### 2.2 Create Missing Migrations
Based on current entities, create migrations for:
- [ ] **V001__Initial_Schema.sql** - Core tables (users, roles, etc.)
- [ ] **V002__Add_Job_Tables.sql** - Job and application tables
- [ ] **V003__Add_Student_Profile_Tables.sql** - Student profiles, CVs, etc.
- [ ] Review existing V004-V20251003 migrations

### 2.3 Add Database Indexes
Create **V100__Add_Performance_Indexes.sql**:
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Job searches
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);

-- Application tracking
CREATE INDEX idx_applications_student_id ON job_applications(student_id);
CREATE INDEX idx_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_applications_status ON job_applications(status);

-- Student profile searches
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_verified ON student_profiles(verified);

-- Full-text search (if needed)
CREATE INDEX idx_jobs_title_search ON jobs USING GIN(to_tsvector('english', title));
CREATE INDEX idx_jobs_description_search ON jobs USING GIN(to_tsvector('english', description));
```

### 2.4 Data Seeding Strategy
Create seed data migrations for development:
- [ ] **V200__Seed_Roles.sql** - Insert default roles (ADMIN, STUDENT, EMPLOYER)
- [ ] **V201__Seed_Test_Users.sql** - Test users for development
- [ ] **V202__Seed_Test_Jobs.sql** - Sample jobs for testing

---

## Phase 3: Render PostgreSQL Setup (Day 5)

### 3.1 Create Render PostgreSQL Database
1. **Sign up/Login to Render**: https://render.com
2. **Create New PostgreSQL Database**:
   - Name: `ojtech-db`
   - Region: Choose closest to target users (e.g., Oregon US West)
   - Plan: Start with Free tier (can upgrade later)
   - PostgreSQL Version: 15 or 16

3. **Note Database Credentials**:
   - Internal Database URL (for Render services)
   - External Database URL (for local testing)
   - Database name, username, password

### 3.2 Database Configuration
Once created, Render provides:
```
Internal Database URL: 
postgresql://ojtech_db_user:<password>@<internal-host>/ojtech_db

External Database URL:
postgresql://ojtech_db_user:<password>@<external-host>/ojtech_db
```

### 3.3 Connect Locally to Render PostgreSQL
Test connection using external URL:
- [ ] Update `application-prod.properties` with Render database URL
- [ ] Test connection from local machine
- [ ] Run migrations against Render database
- [ ] Verify schema creation

---

## Phase 4: Backend Application Configuration (Days 6-7)

### 4.1 Environment Variables Strategy
Create environment-based configuration:

**application.properties (common):**
```properties
# Server
server.port=${PORT:8081}

# Database - will be overridden by environment
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=${SHOW_SQL:false}

# JWT
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=${JWT_EXPIRATION:86400000}

# OAuth2
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}

spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}
spring.security.oauth2.client.registration.github.redirect-uri=${BACKEND_BASE_URL}/auth/github/callback

# Cloudinary
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

# Gemini API
gemini.api.key=${GEMINI_API_KEY}

# Email
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}

# URLs
app.base-url=${FRONTEND_URL}
backend.base-url=${BACKEND_BASE_URL}

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

### 4.2 Create .env.example File
```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/ojtech_dev
DB_USERNAME=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000

# OAuth2 - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth2 - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# Email
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_BASE_URL=http://localhost:8081
```

### 4.3 Update OAuth2 Redirect URLs
Update OAuth2 provider configurations:

**Google Cloud Console:**
- Add authorized redirect URI: `https://ojtech-api.onrender.com/login/oauth2/code/google`
- Add authorized JavaScript origin: `https://ojtech-api.onrender.com`

**GitHub OAuth App:**
- Update callback URL: `https://ojtech-api.onrender.com/auth/github/callback`

### 4.4 Handle CORS Configuration
Update CORS configuration for production domain:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.base-url}")
    private String frontendUrl;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(frontendUrl)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## Phase 5: Render Backend Deployment (Days 8-9)

### 5.1 Prepare Application for Deployment
- [ ] Ensure `mvnw` and `mvnw.cmd` are in repository
- [ ] Create `render.yaml` (optional, for blueprint)
- [ ] Update `.gitignore` to exclude sensitive files
- [ ] Create production-ready `application.properties`

### 5.2 Create Render Web Service
1. **Navigate to Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository**:
   - Authorize Render to access your repository
   - Select the repository: `ojtech-rewritten`

4. **Configure Service**:
   - **Name**: `ojtech-api`
   - **Region**: Same as database (Oregon US West)
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `JavaSpringBootOAuth2JwtCrud`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/ojtech-api-0.0.1-SNAPSHOT.jar`
   - **Plan**: Free (or paid for better performance)

### 5.3 Configure Environment Variables
In Render service settings, add all environment variables:

```
DATABASE_URL=<Internal PostgreSQL URL from Render>
DB_USERNAME=<from Render DB>
DB_PASSWORD=<from Render DB>

PORT=8081

JWT_SECRET=<generate strong secret>
JWT_EXPIRATION=86400000

GOOGLE_CLIENT_ID=<from Google Console>
GOOGLE_CLIENT_SECRET=<from Google Console>

GITHUB_CLIENT_ID=<from GitHub>
GITHUB_CLIENT_SECRET=<from GitHub>

CLOUDINARY_CLOUD_NAME=df7wrezta
CLOUDINARY_API_KEY=925158563376871
CLOUDINARY_API_SECRET=LzSstJ4NWGoQPHFcMppJQHhHdbA

GEMINI_API_KEY=AIzaSyA8-ny-LlhOwSvU9kT6M5lWLG2eLzvvWpM

EMAIL_USERNAME=ojtech.team@gmail.com
EMAIL_PASSWORD=mldv wsfs ukse mtlu

FRONTEND_URL=https://your-frontend-domain.com
BACKEND_BASE_URL=https://ojtech-api.onrender.com

SHOW_SQL=false

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

### 5.4 Database Connection Configuration
Render provides internal database URL - parse it:
```
postgresql://user:password@host:5432/database
```

Convert to JDBC format:
```
DATABASE_URL=jdbc:postgresql://host:5432/database
DB_USERNAME=user
DB_PASSWORD=password
```

### 5.5 Deploy Application
1. **Save configuration**
2. **Render will automatically**:
   - Clone repository
   - Run build command
   - Execute database migrations (Flyway)
   - Start the application
3. **Monitor deployment logs**
4. **Verify health check**: `https://ojtech-api.onrender.com/actuator/health`

---

## Phase 6: Testing & Verification (Days 10-11)

### 6.1 API Testing
- [ ] Test health endpoint: `/actuator/health`
- [ ] Test authentication endpoints
  - [ ] POST `/api/auth/signup`
  - [ ] POST `/api/auth/login`
  - [ ] Google OAuth flow
  - [ ] GitHub OAuth flow
- [ ] Test protected endpoints
- [ ] Verify JWT token generation and validation

### 6.2 Database Verification
- [ ] Connect to Render PostgreSQL using pgAdmin
- [ ] Verify all tables created correctly
- [ ] Check migration history in `flyway_schema_history`
- [ ] Verify indexes are in place
- [ ] Test complex queries

### 6.3 Integration Testing
- [ ] Job creation and retrieval
- [ ] Student profile management
- [ ] CV upload and generation
- [ ] Email sending functionality
- [ ] File upload to Cloudinary
- [ ] Job matching functionality

### 6.4 Performance Testing
- [ ] Test response times under load
- [ ] Monitor database connection pool
- [ ] Check memory usage
- [ ] Verify no N+1 query issues

---

## Phase 7: Frontend Integration (Days 12-13)

### 7.1 Update Frontend API Configuration
**File: `ojtech-vite/src/apiConfig.ts`**
```typescript
const isDevelopment = import.meta.env.MODE === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8081'
  : 'https://ojtech-api.onrender.com';

export const FRONTEND_URL = isDevelopment
  ? 'http://localhost:5173'
  : 'https://your-frontend-domain.com';
```

### 7.2 Update OAuth Callback URLs
Update all OAuth callback handlers to use production URLs when deployed.

### 7.3 Frontend Deployment
Deploy frontend to Vercel/Netlify/Render:
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy and test

---

## Phase 8: Monitoring & Optimization (Day 14)

### 8.1 Set Up Monitoring
- [ ] Enable Render metrics
- [ ] Monitor database performance
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure log aggregation

### 8.2 Database Optimization
- [ ] Review slow queries
- [ ] Add missing indexes
- [ ] Optimize connection pool settings
- [ ] Set up database backups

### 8.3 Security Hardening
- [ ] Rotate JWT secret
- [ ] Review CORS settings
- [ ] Enable HTTPS only
- [ ] Implement rate limiting
- [ ] Review SQL injection prevention
- [ ] Enable security headers

---

## Phase 9: Backup & Disaster Recovery (Day 15)

### 9.1 Database Backups
Render PostgreSQL automatic backups:
- Free tier: Daily backups (retained for 7 days)
- Paid tiers: Multiple daily backups (retained longer)

Additional backup strategy:
- [ ] Schedule manual backups
- [ ] Export backup to external storage
- [ ] Document restore procedure

### 9.2 Disaster Recovery Plan
- [ ] Document rollback procedure
- [ ] Test database restore
- [ ] Document environment variable recovery
- [ ] Create runbook for common issues

---

## Migration Checklist Summary

### Pre-Migration
- [ ] Install PostgreSQL locally
- [ ] Add PostgreSQL driver to pom.xml
- [ ] Add Flyway dependency
- [ ] Create application profiles
- [ ] Review all migration files
- [ ] Test locally with PostgreSQL

### Render Setup
- [ ] Create Render account
- [ ] Create PostgreSQL database on Render
- [ ] Note database credentials
- [ ] Create Web Service on Render
- [ ] Configure environment variables
- [ ] Update OAuth redirect URLs

### Deployment
- [ ] Push code to GitHub
- [ ] Trigger Render deployment
- [ ] Monitor build logs
- [ ] Verify migrations run successfully
- [ ] Test API endpoints
- [ ] Update frontend configuration
- [ ] Deploy frontend

### Post-Deployment
- [ ] Test full application flow
- [ ] Monitor performance
- [ ] Set up monitoring/alerts
- [ ] Document production environment
- [ ] Create backup strategy

---

## Estimated Timeline

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| 1 | Local PostgreSQL Setup | 2 days | None |
| 2 | Schema Review & Optimization | 2 days | Phase 1 |
| 3 | Render PostgreSQL Setup | 1 day | Phase 2 |
| 4 | Backend Configuration | 2 days | Phase 3 |
| 5 | Render Deployment | 2 days | Phase 4 |
| 6 | Testing & Verification | 2 days | Phase 5 |
| 7 | Frontend Integration | 2 days | Phase 6 |
| 8 | Monitoring & Optimization | 1 day | Phase 7 |
| 9 | Backup & DR | 1 day | Phase 8 |
| **Total** | | **15 days** | |

---

## Risk Mitigation

### Risk 1: Migration Failures
- **Mitigation**: Test all migrations locally before production
- **Backup Plan**: Keep H2 configuration for quick rollback

### Risk 2: Data Loss
- **Mitigation**: Always test on non-production database first
- **Backup Plan**: Render automatic backups + manual exports

### Risk 3: OAuth Configuration Issues
- **Mitigation**: Update all redirect URLs before deployment
- **Backup Plan**: Maintain local/JWT authentication as fallback

### Risk 4: Performance Issues
- **Mitigation**: Add proper indexes, optimize queries
- **Backup Plan**: Upgrade Render plan if free tier insufficient

### Risk 5: Render Free Tier Limitations
- **Limitation**: Service spins down after 15 min inactivity (cold starts)
- **Mitigation**: Consider paid tier ($7/month) for production
- **Alternative**: Use cron job to ping service every 10 minutes

---

## Cost Estimation

### Render Pricing (as of 2024)
- **PostgreSQL**:
  - Free: 256MB RAM, 1GB storage, shared CPU
  - Starter: $7/month - 256MB RAM, 1GB storage
  - Standard: $20/month - 4GB RAM, 10GB storage

- **Web Service**:
  - Free: 512MB RAM, shared CPU (spins down after inactivity)
  - Starter: $7/month - 512MB RAM, always on
  - Standard: $25/month - 2GB RAM, always on

**Recommended for Production**: 
- Database: Starter ($7/month)
- Web Service: Starter ($7/month)
- **Total**: ~$14/month

**Development/Testing**: Use free tier

---

## Additional Resources

### Documentation
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [Render Web Services Docs](https://render.com/docs/web-services)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Spring Boot PostgreSQL](https://spring.io/guides/gs/accessing-data-postgresql/)

### Useful Commands
```bash
# Local PostgreSQL commands
psql -U postgres -d ojtech_dev

# Maven commands
./mvnw clean package
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Database backup
pg_dump -U username -d database_name > backup.sql

# Database restore
psql -U username -d database_name < backup.sql
```

---

## Next Steps

1. **Review this plan** with your team
2. **Set up local PostgreSQL** environment
3. **Create a development branch** for migration work
4. **Start with Phase 1** and work sequentially
5. **Test thoroughly** at each phase
6. **Document any deviations** from this plan
7. **Update this document** as you progress

---

## Notes

- **Sensitive Information**: Never commit actual credentials to version control
- **Environment Variables**: Use Render's environment variable feature
- **Database Migrations**: Always backup before running migrations
- **Testing**: Test each phase before moving to the next
- **Rollback Plan**: Keep H2 configuration for emergency rollback

---

**Plan Created**: October 3, 2025
**Last Updated**: October 3, 2025
**Status**: Ready for Implementation
