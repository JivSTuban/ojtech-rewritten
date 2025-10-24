# Migration Quick Start Guide

## 🚀 Get Started in 30 Minutes

This is a condensed version of the full migration plan for quick reference.

---

## Step 1: Add PostgreSQL Dependency (5 minutes)

Add to `JavaSpringBootOAuth2JwtCrud/pom.xml` after the H2 dependency:

```xml
<!-- PostgreSQL Database -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Flyway for migrations -->
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

Change H2 scope:
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope> <!-- Changed from runtime -->
</dependency>
```

---

## Step 2: Create Configuration Files (10 minutes)

### Create `application-dev.properties`
```properties
# Development PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/ojtech_dev
spring.datasource.username=postgres
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

### Create `application-prod.properties`
```properties
# Production Render PostgreSQL Configuration
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

### Update main `application.properties`
Add at the top:
```properties
# Active Profile
spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}
```

Comment out or remove H2-specific configuration.

---

## Step 3: Install PostgreSQL (5 minutes)

### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your password (you'll set one during installation)
4. Default port: 5432

### Create Database:
Open pgAdmin or use command line:
```sql
CREATE DATABASE ojtech_dev;
```

---

## Step 4: Create Initial Migration (5 minutes)

Create `JavaSpringBootOAuth2JwtCrud/src/main/resources/db/migration/V001__Initial_Schema.sql`

This file should contain your base schema. If you already have entities, you can generate it or write it manually based on your current H2 schema.

---

## Step 5: Run Application (5 minutes)

```bash
cd JavaSpringBootOAuth2JwtCrud
./mvnw clean package
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Watch for:
- ✅ Flyway migrations executing
- ✅ Application starting successfully
- ✅ No database connection errors

---

## Step 6: Render Setup (15 minutes)

### A. Create Database
1. Go to https://render.com
2. New → PostgreSQL
3. Name: `ojtech-db`
4. Region: Oregon (US West)
5. Create Database
6. **Save the credentials!**

### B. Create Web Service
1. New → Web Service
2. Connect your GitHub repo
3. Configuration:
   - **Name**: `ojtech-api`
   - **Root Directory**: `JavaSpringBootOAuth2JwtCrud`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/ojtech-api-0.0.1-SNAPSHOT.jar`

### C. Environment Variables
Add these in Render dashboard:

```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://[from-render-internal-url]
DB_USERNAME=[from-render]
DB_PASSWORD=[from-render]

JWT_SECRET=[generate-random-string]
GOOGLE_CLIENT_ID=[your-value]
GOOGLE_CLIENT_SECRET=[your-value]
GITHUB_CLIENT_ID=[your-value]
GITHUB_CLIENT_SECRET=[your-value]

CLOUDINARY_CLOUD_NAME=df7wrezta
CLOUDINARY_API_KEY=925158563376871
CLOUDINARY_API_SECRET=LzSstJ4NWGoQPHFcMppJQHhHdbA

GEMINI_API_KEY=AIzaSyA8-ny-LlhOwSvU9kT6M5lWLG2eLzvvWpM

EMAIL_ENABLED=true
BREVO_API_KEY=<your-brevo-api-key>
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
SPRING_MAIL_EMAIL=ojtech.team@gmail.com

FRONTEND_URL=https://[your-frontend-url]
BACKEND_BASE_URL=https://ojtech-api.onrender.com
```

**Note**: Render provides the database URL in format:
```
postgresql://user:password@host:port/database
```

Convert to JDBC format:
```
jdbc:postgresql://host:port/database
```

---

## Step 7: Deploy

1. Click "Create Web Service"
2. Watch build logs
3. Wait for deployment (5-10 minutes first time)
4. Test: `https://ojtech-api.onrender.com/actuator/health`

---

## Common Issues & Solutions

### Issue: "flyway_schema_history table not found"
**Solution**: Flyway will create it automatically on first run

### Issue: "Could not connect to database"
**Solution**: Check DATABASE_URL format and credentials

### Issue: "Application fails to start"
**Solution**: Check Render logs for specific error

### Issue: "Cold starts are slow"
**Solution**: Render free tier spins down after 15 min. Upgrade to paid tier or use a ping service.

---

## Testing Checklist

After deployment, test:
- [ ] Health endpoint: `/actuator/health`
- [ ] Login: `POST /api/auth/login`
- [ ] Register: `POST /api/auth/signup`
- [ ] Protected endpoint (with JWT token)
- [ ] OAuth flow (Google/GitHub)

---

## Rollback Plan

If something goes wrong:

1. **Local**: Switch back to H2 by setting profile to `h2`
2. **Render**: Revert to previous deployment in Render dashboard
3. **Database**: Render keeps daily backups (7 days)

---

## Next Steps After Deployment

1. ✅ Update frontend API URLs
2. ✅ Update OAuth redirect URLs in Google/GitHub console
3. ✅ Test entire application flow
4. ✅ Set up monitoring
5. ✅ Configure custom domain (optional)

---

## Support & Resources

- **Full Plan**: See `H2_TO_POSTGRES_RENDER_DEPLOYMENT_PLAN.md`
- **Render Docs**: https://render.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Flyway Docs**: https://flywaydb.org/documentation/

---

**Need Help?** 
- Check Render logs first
- Review Flyway migration history
- Verify environment variables
- Check database connection
