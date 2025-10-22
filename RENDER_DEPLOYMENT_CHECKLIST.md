# 🚀 OJTech API - Render Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup ✅
- [ ] Create PostgreSQL database (Neon or Render)
- [ ] Copy connection string
- [ ] Test connection
- [ ] Note: Database will be initialized on first deployment

**Recommended**: Neon PostgreSQL (https://neon.tech) - Free tier with pooling

---

### 2. Generate JWT Secret ✅
```bash
# Run this command to generate a secure secret:
openssl rand -base64 64
```
- [ ] Generated new JWT secret
- [ ] Saved securely (you'll need it for Render)

---

### 3. Cloudinary Setup ✅
Go to: https://cloudinary.com/console
- [ ] Created/logged into Cloudinary account
- [ ] Copied Cloud Name
- [ ] Copied API Key
- [ ] Copied API Secret
- [ ] Created Upload Preset (Settings → Upload → Upload presets)

---

### 4. Google OAuth Setup ✅
Go to: https://console.cloud.google.com/apis/credentials
- [ ] Created OAuth 2.0 Client ID
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Added authorized redirect URI (update after Render deployment):
  - `https://your-api.onrender.com/login/oauth2/code/google`

---

### 5. GitHub OAuth Setup ✅
Go to: https://github.com/settings/developers
- [ ] Created OAuth App
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Set Authorization callback URL:
  - `https://your-frontend-app.netlify.app/auth/github/callback`

---

### 6. Gemini API Setup ✅
Go to: https://makersuite.google.com/app/apikey
- [ ] Created/copied API key

---

### 7. Brevo Email Setup (Optional) ✅
Go to: https://app.brevo.com/settings/keys/api
- [ ] Created Brevo account
- [ ] Copied API key
- [ ] Verified sender email address
- [ ] **OR** Set `EMAIL_ENABLED=false` to skip email

---

## Render Deployment

### 8. Create Web Service on Render ✅
1. Go to: https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - [ ] **Name**: `ojtech-api` (or your choice)
   - [ ] **Region**: Select closest to your users
   - [ ] **Branch**: `main`
   - [ ] **Root Directory**: `JavaSpringBootOAuth2JwtCrud`
   - [ ] **Runtime**: Docker
   - [ ] **Instance Type**: Free (or Starter for always-on)

---

### 9. Add Environment Variables ✅
Go to: Environment tab in Render dashboard

**Copy from `RENDER_ENV_VARIABLES.txt` and paste each variable:**

#### Database (3 variables)
- [ ] `DATABASE_URL`
- [ ] `DATABASE_USERNAME`
- [ ] `DATABASE_PASSWORD`

#### Security (1 variable)
- [ ] `JWT_SECRET` (use generated secret from step 2)

#### Application URLs (2 variables)
- [ ] `FRONTEND_URL` (your Netlify/Vercel URL)
- [ ] `BACKEND_URL` (will update after deployment)

#### Cloudinary (4 variables)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `CLOUDINARY_PRESET`

#### OAuth (4 variables)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`

#### AI & Email (4 variables)
- [ ] `GEMINI_API_KEY`
- [ ] `EMAIL_ENABLED` (true or false)
- [ ] `BREVO_API_KEY` (if email enabled)
- [ ] `BREVO_API_URL` (if email enabled)
- [ ] `SPRING_MAIL_EMAIL` (if email enabled)

**Total: 15 environment variables**

---

### 10. Deploy ✅
- [ ] Click **Create Web Service**
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check logs for any errors
- [ ] Note your Render URL: `https://your-api.onrender.com`

---

## Post-Deployment Configuration

### 11. Update Backend URL ✅
- [ ] Copy your Render service URL
- [ ] Update `BACKEND_URL` environment variable in Render
- [ ] Redeploy if necessary

---

### 12. Update OAuth Redirect URIs ✅

**Google OAuth**:
- [ ] Go to Google Cloud Console
- [ ] Add redirect URI: `https://your-actual-api.onrender.com/login/oauth2/code/google`

**GitHub OAuth**:
- [ ] Already configured with frontend callback URL
- [ ] Verify it matches your frontend URL

---

### 13. Update Frontend Configuration ✅
Update your frontend `.env` file:
- [ ] `VITE_API_URL=https://your-actual-api.onrender.com`
- [ ] Redeploy frontend

---

### 14. Database Initialization ✅

**Option A: Auto-create (First deployment only)**
1. [ ] Temporarily change `spring.jpa.hibernate.ddl-auto=create` in `application-prod.properties`
2. [ ] Deploy
3. [ ] Change back to `validate`
4. [ ] Redeploy

**Option B: Manual seeding**
- [ ] Run database seeder through application startup
- [ ] Check logs to confirm tables created

---

## Testing & Verification

### 15. Test Endpoints ✅
- [ ] Health check: `https://your-api.onrender.com/actuator/health`
- [ ] API docs: `https://your-api.onrender.com/swagger-ui.html`
- [ ] API JSON: `https://your-api.onrender.com/api-docs`

---

### 16. Test Authentication Flows ✅
- [ ] Register new user (email/password)
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Login with GitHub OAuth
- [ ] JWT token generation working
- [ ] Protected endpoints require authentication

---

### 17. Test Core Features ✅
- [ ] File upload (CV/profile picture) to Cloudinary
- [ ] Database operations (CRUD)
- [ ] Email sending (if enabled)
- [ ] AI features (Gemini API)
- [ ] Role-based access control (STUDENT, NLO, ADMIN)

---

### 18. Monitor & Debug ✅
- [ ] Check Render logs for errors
- [ ] Monitor response times
- [ ] Check database connections
- [ ] Verify no memory/CPU issues

---

## Security Verification

### 19. Security Checklist ✅
- [ ] JWT secret is strong and unique (not default)
- [ ] All OAuth secrets are production values
- [ ] Database uses SSL (`sslmode=require`)
- [ ] No sensitive data in logs
- [ ] CORS configured for production frontend
- [ ] All API keys are production keys (not development)

---

## Documentation

### 20. Update Documentation ✅
- [ ] Update README with production URLs
- [ ] Document any deployment-specific configurations
- [ ] Share API documentation URL with team
- [ ] Update frontend team with new backend URL

---

## 🎉 Deployment Complete!

### Your URLs:
- **API**: https://your-api.onrender.com
- **API Docs**: https://your-api.onrender.com/swagger-ui.html
- **Health**: https://your-api.onrender.com/actuator/health

### Next Steps:
1. Monitor logs for first 24 hours
2. Test with real users
3. Set up monitoring/alerts (optional)
4. Consider upgrading to paid plan for always-on service

---

## 🆘 Troubleshooting

### Build Failed
- Check Java version (requires Java 21)
- Verify Dockerfile is correct
- Check Maven dependencies in `pom.xml`
- Review build logs in Render

### Database Connection Failed
- Verify `DATABASE_URL` format
- Check database credentials
- Ensure database allows Render IPs
- Verify SSL mode is enabled

### OAuth Not Working
- Verify redirect URIs match exactly
- Check client IDs and secrets
- Ensure OAuth apps are active
- Check CORS configuration

### Application Won't Start
- Review Render logs
- Verify all environment variables set
- Check for missing dependencies
- Verify port binding (uses `${PORT}`)

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Spring Boot Docs**: https://docs.spring.io/spring-boot

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Render Service URL**: _________________
**Database Provider**: _________________
