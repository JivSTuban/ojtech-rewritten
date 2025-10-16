# Render Environment Variables Configuration

## Required Environment Variables for Render Deployment

### Database Configuration (PostgreSQL)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://<your-render-postgres-host>:<port>/<database-name>?sslmode=require
SPRING_DATASOURCE_USERNAME=<your-postgres-username>
SPRING_DATASOURCE_PASSWORD=<your-postgres-password>
```

**Note:** If using Render's PostgreSQL service, you can use the Internal Database URL provided by Render.

### JPA/Hibernate Configuration
```
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
```

**Important:** Use `update` instead of `create` in production to avoid data loss on restarts.

### JWT Configuration
```
APP_JWT_SECRET=<generate-a-strong-random-secret-key-minimum-256-bits>
APP_JWT_EXPIRATION=86400000
APP_JWT_HEADER=Authorization
APP_JWT_PREFIX=Bearer 
```

**Security Note:** Generate a strong, unique JWT secret for production. Use a tool like `openssl rand -base64 64`.

### Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=df7wrezta
CLOUDINARY_API_KEY=925158563376871
CLOUDINARY_API_SECRET=LzSstJ4NWGoQPHFcMppJQHhHdbA
CLOUDINARY_API_SECRET_PRESET=OJTECHPDF
```

### OAuth2 Configuration - Google
```
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=<your-google-client-id>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_SCOPE=email,profile
```

**Action Required:** Update Google OAuth2 redirect URIs in Google Cloud Console to include your Render URL.

### OAuth2 Configuration - GitHub
```
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID=<your-github-client-id>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET=<your-github-client-secret>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_SCOPE=user:email
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_REDIRECT_URI=${APP_BASE_URL}/auth/github/callback
```

**Action Required:** Update GitHub OAuth App callback URL to your Render URL.

### Gemini API Configuration
```
GEMINI_API_KEY=<your-gemini-api-key>
```

### Email Configuration (Brevo SMTP)
```
EMAIL_ENABLED=true
SPRING_MAIL_HOST=smtp-relay.brevo.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=991830001@smtp-brevo.com
SPRING_MAIL_PASSWORD=<your-brevo-smtp-password>
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
SPRING_MAIL_EMAIL=ojtech.team@gmail.com
```

**Note:** Email should work properly on Render (unlike local development with DNS issues).

### Application URLs
```
APP_BASE_URL=https://<your-frontend-url>.netlify.app
BACKEND_BASE_URL=https://<your-render-service-name>.onrender.com
```

**Important:** Update these with your actual deployment URLs.

### File Upload Configuration
```
SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE=10MB
SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE=10MB
```

### Logging Configuration
```
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=INFO
LOGGING_LEVEL_COM_MELARDEV_SPRING_JWTOAUTH=INFO
```

**Note:** Set to INFO in production to reduce log verbosity.

---

## Quick Setup Checklist

### 1. Database Setup
- [ ] Create a PostgreSQL database on Render
- [ ] Copy the Internal Database URL
- [ ] Set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`

### 2. Security Configuration
- [ ] Generate a new JWT secret: `openssl rand -base64 64`
- [ ] Set `APP_JWT_SECRET` with the generated value
- [ ] Update `APP_BASE_URL` with your frontend URL
- [ ] Update `BACKEND_BASE_URL` with your Render service URL

### 3. OAuth2 Configuration
- [ ] Update Google OAuth2 redirect URIs in Google Cloud Console
- [ ] Update GitHub OAuth App callback URL
- [ ] Set OAuth2 client IDs and secrets in Render

### 4. Third-Party Services
- [ ] Verify Cloudinary credentials
- [ ] Verify Brevo SMTP credentials
- [ ] Verify Gemini API key

### 5. Production Settings
- [ ] Set `SPRING_JPA_HIBERNATE_DDL_AUTO=update` (NOT create)
- [ ] Set `SPRING_JPA_SHOW_SQL=false`
- [ ] Set logging levels to INFO

---

## Environment Variable Format for Render

Render uses **dot notation** for nested properties. Spring Boot automatically converts them:

```
spring.datasource.url → SPRING_DATASOURCE_URL
app.jwt.secret → APP_JWT_SECRET
spring.mail.host → SPRING_MAIL_HOST
```

---

## Important Notes

1. **Database DDL Mode:** Use `update` in production, not `create` (which drops tables on restart)
2. **JWT Secret:** Must be different from development and at least 256 bits
3. **CORS Configuration:** Ensure your backend allows requests from your frontend URL
4. **OAuth2 Callbacks:** Update all OAuth2 provider redirect URIs to match your Render URL
5. **Port Binding:** Render automatically sets the `PORT` environment variable - the Dockerfile handles this
6. **SSL/TLS:** Render provides HTTPS automatically - no additional configuration needed

---

## Testing After Deployment

1. Check health endpoint: `https://<your-service>.onrender.com/actuator/health`
2. Test API docs: `https://<your-service>.onrender.com/swagger-ui.html`
3. Verify database connection in logs
4. Test authentication endpoints
5. Test OAuth2 login flows
6. Verify email sending functionality

---

## Common Issues

### Issue: Database connection fails
**Solution:** Verify the PostgreSQL URL format and credentials. Use Render's Internal Database URL.

### Issue: OAuth2 redirect fails
**Solution:** Update redirect URIs in Google/GitHub to match your Render URL exactly.

### Issue: JWT token validation fails
**Solution:** Ensure `APP_JWT_SECRET` is set and matches across all instances.

### Issue: CORS errors
**Solution:** Update CORS configuration to allow your frontend domain.

### Issue: Port binding fails
**Solution:** Ensure Dockerfile uses `${PORT}` environment variable (already configured).
