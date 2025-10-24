# OJTech API - Render Deployment Guide

## Prerequisites
1. Render account (https://render.com)
2. PostgreSQL database (Neon, Render PostgreSQL, or similar)
3. GitHub repository connected to Render

## Deployment Steps

### 1. Create Web Service on Render
1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `ojtech-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `JavaSpringBootOAuth2JwtCrud`
   - **Runtime**: Docker
   - **Instance Type**: Free or Starter (minimum)

### 2. Build Configuration
Render will automatically detect the Dockerfile. No additional build commands needed.

**Build Command**: (Leave empty - Docker handles this)
**Start Command**: (Leave empty - Dockerfile CMD handles this)

### 3. Environment Variables

Copy and paste these environment variables into Render Dashboard → Environment tab.
**Replace the placeholder values with your actual credentials.**

---

## 🔐 REQUIRED ENVIRONMENT VARIABLES

### Database Configuration (PostgreSQL)
```
DATABASE_URL=jdbc:postgresql://your-postgres-host:5432/your-database?sslmode=require
DATABASE_USERNAME=your_database_user
DATABASE_PASSWORD=your_database_password
```

### JWT Security
```
JWT_SECRET=YourVeryLongAndSecureRandomSecretKeyForProductionAtLeast64Characters
```
**⚠️ IMPORTANT**: Generate a strong random secret (minimum 64 characters). Use: `openssl rand -base64 64`

### Application URLs
```
FRONTEND_URL=https://your-frontend-app.netlify.app
BACKEND_URL=https://your-api.onrender.com
```
**Note**: Update `BACKEND_URL` after Render assigns your service URL

### Cloudinary (File Storage)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_PRESET=your_upload_preset
```
Get these from: https://cloudinary.com/console

### Google OAuth2
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
Get these from: https://console.cloud.google.com/apis/credentials

**Setup**:
1. Create OAuth 2.0 Client ID
2. Add authorized redirect URIs:
   - `https://your-api.onrender.com/login/oauth2/code/google`
   - `http://localhost:8081/login/oauth2/code/google` (for local testing)

### GitHub OAuth2
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```
Get these from: https://github.com/settings/developers

**Setup**:
1. Create OAuth App
2. Set Authorization callback URL: `https://your-frontend-app.netlify.app/auth/github/callback`

### Gemini API (AI Features)
```
GEMINI_API_KEY=your_gemini_api_key
```
Get from: https://makersuite.google.com/app/apikey

### Email Service (Brevo)
```
EMAIL_ENABLED=true
BREVO_API_KEY=your_brevo_api_key
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
SPRING_MAIL_EMAIL=your-verified-sender@email.com
```
Get API key from: https://app.brevo.com/settings/keys/api

**⚠️ Note**: If you encounter email issues, set `EMAIL_ENABLED=false` to disable email functionality.

---

## 📋 COMPLETE ENVIRONMENT VARIABLES LIST (Copy-Paste Ready)

```env
# Database Configuration
DATABASE_URL=jdbc:postgresql://your-postgres-host:5432/your-database?sslmode=require
DATABASE_USERNAME=your_database_user
DATABASE_PASSWORD=your_database_password

# JWT Security (GENERATE NEW SECRET!)
JWT_SECRET=YourVeryLongAndSecureRandomSecretKeyForProductionAtLeast64Characters

# Application URLs (UPDATE AFTER DEPLOYMENT)
FRONTEND_URL=https://your-frontend-app.netlify.app
BACKEND_URL=https://your-api.onrender.com

# Cloudinary File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_PRESET=your_upload_preset

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth2
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key

# Email Service (Brevo)
EMAIL_ENABLED=true
BREVO_API_KEY=your_brevo_api_key
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
SPRING_MAIL_EMAIL=your-verified-sender@email.com
```

---

## 🗄️ Database Setup

### Option 1: Neon PostgreSQL (Recommended - Free Tier)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Use pooled connection for better performance

### Option 2: Render PostgreSQL
1. Render Dashboard → New → PostgreSQL
2. Copy Internal Database URL
3. Use in `DATABASE_URL` variable

### Database Initialization
The application uses `spring.jpa.hibernate.ddl-auto=validate` in production.

**First Deployment**:
1. Temporarily change to `create` in `application-prod.properties`
2. Deploy and let it create tables
3. Change back to `validate` for subsequent deployments
4. Redeploy

**OR** run migrations manually using database seeder.

---

## 🚀 Post-Deployment Steps

### 1. Update OAuth Redirect URIs
After Render assigns your URL (e.g., `https://ojtech-api.onrender.com`):

**Google OAuth**:
- Add: `https://ojtech-api.onrender.com/login/oauth2/code/google`

**GitHub OAuth**:
- Update callback URL in GitHub app settings

### 2. Update Frontend Configuration
Update your frontend `.env` file:
```env
VITE_API_URL=https://ojtech-api.onrender.com
```

### 3. Update BACKEND_URL Environment Variable
In Render dashboard, update:
```
BACKEND_URL=https://ojtech-api.onrender.com
```

### 4. Test Endpoints
- Health check: `https://your-api.onrender.com/actuator/health`
- API docs: `https://your-api.onrender.com/swagger-ui.html`
- API JSON: `https://your-api.onrender.com/api-docs`

---

## 🔧 Troubleshooting

### Build Failures
- **Java Version**: Ensure Dockerfile uses Java 21
- **Maven Build**: Check `pom.xml` dependencies
- **Memory**: Upgrade to paid plan if build runs out of memory

### Database Connection Issues
- Verify `DATABASE_URL` format includes `?sslmode=require`
- Check database credentials
- Ensure database allows connections from Render IPs

### OAuth Issues
- Verify redirect URIs match exactly (including https://)
- Check client IDs and secrets are correct
- Ensure OAuth apps are not in development mode

### Email Issues
- Set `EMAIL_ENABLED=false` if email service unavailable
- Verify Brevo API key is valid
- Check sender email is verified in Brevo

### Application Won't Start
- Check Render logs: Dashboard → Logs tab
- Verify all required environment variables are set
- Check for port binding issues (should use `${PORT}`)

---

## 📊 Monitoring

### Render Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Response times
- **Events**: Deployment history

### Health Endpoints
```
GET /actuator/health
GET /actuator/info
```

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to your connected branch:
1. Push code to GitHub
2. Render detects changes
3. Builds Docker image
4. Deploys new version
5. Zero-downtime deployment

### Manual Deploy
Render Dashboard → Manual Deploy → Deploy latest commit

---

## 💰 Cost Optimization

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- 750 hours/month free
- Cold starts take 30-60 seconds

### Recommendations
- Use Render PostgreSQL free tier (90 days)
- Upgrade to Starter ($7/month) for always-on service
- Use Neon PostgreSQL free tier for database

---

## 🔐 Security Checklist

- [ ] Generated strong JWT_SECRET (64+ characters)
- [ ] All OAuth secrets are production values (not development)
- [ ] Database uses SSL connection (`sslmode=require`)
- [ ] Cloudinary credentials are for production account
- [ ] Email sender is verified
- [ ] CORS configured for production frontend URL
- [ ] No sensitive data in logs (check `application-prod.properties`)

---

## 📝 Notes

- **Java Version**: Application requires Java 21
- **Spring Profile**: Automatically uses `prod` profile
- **Port**: Render assigns port dynamically via `PORT` env variable
- **Timezone**: UTC by default
- **File Uploads**: Stored in Cloudinary (not local filesystem)

---

## 🆘 Support Resources

- **Render Docs**: https://render.com/docs
- **Spring Boot Docs**: https://docs.spring.io/spring-boot/docs/current/reference/html/
- **PostgreSQL on Render**: https://render.com/docs/databases

---

## ✅ Deployment Checklist

Before deploying:
- [ ] All environment variables configured
- [ ] Database created and accessible
- [ ] OAuth apps configured with correct redirect URIs
- [ ] Cloudinary account set up
- [ ] Brevo email service configured (or EMAIL_ENABLED=false)
- [ ] Frontend URL updated in environment variables
- [ ] JWT secret generated (not using default)

After first deployment:
- [ ] Update BACKEND_URL with actual Render URL
- [ ] Update OAuth redirect URIs with actual Render URL
- [ ] Test all authentication flows
- [ ] Verify database connection
- [ ] Test file upload functionality
- [ ] Verify email sending (if enabled)

---

**Last Updated**: 2025-01-19
**Application**: OJTech API
**Framework**: Spring Boot 3.2.3
**Java Version**: 21
