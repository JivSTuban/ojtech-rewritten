# 🚀 OJTech API - Render Deployment Quick Start

## 📦 What You Need

### 1. **Database** (Choose one)
- **Neon PostgreSQL** (Recommended): https://neon.tech - Free tier
- **Render PostgreSQL**: https://dashboard.render.com - Free 90 days

### 2. **External Services**
- Cloudinary account: https://cloudinary.com
- Google OAuth credentials: https://console.cloud.google.com
- GitHub OAuth app: https://github.com/settings/developers
- Gemini API key: https://makersuite.google.com/app/apikey
- Brevo email (optional): https://app.brevo.com

---

## ⚡ Quick Deploy Steps

### Step 1: Prepare Credentials (15 minutes)
1. **Generate JWT Secret**:
   ```bash
   openssl rand -base64 64
   ```
   Save this output - you'll need it!

2. **Get Database URL** from Neon or Render PostgreSQL

3. **Get Cloudinary credentials** from dashboard (4 values)

4. **Create OAuth apps** and copy credentials (4 values)

5. **Get API keys** for Gemini and Brevo (2 values)

---

### Step 2: Deploy to Render (5 minutes)

1. **Go to Render**: https://dashboard.render.com

2. **New Web Service**:
   - Connect GitHub repository
   - **Root Directory**: `JavaSpringBootOAuth2JwtCrud`
   - **Runtime**: Docker
   - **Instance Type**: Free or Starter

3. **Add Environment Variables**:
   - Open `RENDER_ENV_PASTE.txt`
   - Replace placeholder values with your actual credentials
   - Paste into Render Environment tab (one per line)

4. **Click Deploy** and wait 5-10 minutes

---

### Step 3: Post-Deployment (5 minutes)

1. **Copy your Render URL**: `https://your-service.onrender.com`

2. **Update Environment Variables** in Render:
   ```
   BACKEND_URL=https://your-actual-service.onrender.com
   ```

3. **Update Google OAuth**:
   - Add redirect URI: `https://your-service.onrender.com/login/oauth2/code/google`

4. **Update Frontend**:
   ```env
   VITE_API_URL=https://your-service.onrender.com
   ```

5. **Test**:
   - Health: `https://your-service.onrender.com/actuator/health`
   - Docs: `https://your-service.onrender.com/swagger-ui.html`

---

## 📋 Environment Variables Summary

**Total: 15 variables** (19 if email enabled)

### Required (11 variables):
```
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
FRONTEND_URL
BACKEND_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_PRESET
GEMINI_API_KEY
```

### OAuth (4 variables):
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

### Email - Optional (4 variables):
```
EMAIL_ENABLED=true
BREVO_API_KEY
BREVO_API_URL
SPRING_MAIL_EMAIL
```

**To disable email**: Set `EMAIL_ENABLED=false` and skip Brevo variables

---

## 🎯 Critical Configuration

### 1. JWT Secret
**⚠️ MUST GENERATE NEW SECRET**
```bash
openssl rand -base64 64
```
Never use the default value in production!

### 2. Database URL Format
```
jdbc:postgresql://host:5432/database?sslmode=require
```
Must include `?sslmode=require` for secure connection

### 3. OAuth Redirect URIs
**Google**: `https://your-api.onrender.com/login/oauth2/code/google`
**GitHub**: `https://your-frontend.netlify.app/auth/github/callback`

Must match exactly (including https://)

---

## 📁 Files Created for You

1. **RENDER_DEPLOYMENT_GUIDE.md** - Complete deployment guide
2. **RENDER_ENV_VARIABLES.txt** - Annotated environment variables
3. **RENDER_ENV_PASTE.txt** - Clean copy-paste format
4. **RENDER_DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist
5. **DEPLOYMENT_QUICK_START.md** - This file

---

## 🔧 Render Configuration

### Service Settings:
- **Name**: ojtech-api (or your choice)
- **Region**: Choose closest to users
- **Branch**: main
- **Root Directory**: `JavaSpringBootOAuth2JwtCrud`
- **Runtime**: Docker ✅
- **Build Command**: (empty - Docker handles it)
- **Start Command**: (empty - Dockerfile CMD handles it)

### Instance Type:
- **Free**: Spins down after 15 min inactivity (cold starts)
- **Starter ($7/mo)**: Always on, no cold starts

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Service is running (green status in Render)
- [ ] Health endpoint responds: `/actuator/health`
- [ ] API docs accessible: `/swagger-ui.html`
- [ ] Database connected (check logs)
- [ ] Login with email/password works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] File upload works (Cloudinary)
- [ ] No errors in Render logs

---

## 🐛 Common Issues & Fixes

### Build Failed
**Issue**: Java version mismatch
**Fix**: Dockerfile uses Java 21 - verify `pom.xml` matches

### Database Connection Failed
**Issue**: Wrong connection string format
**Fix**: Ensure URL includes `?sslmode=require`

### OAuth Not Working
**Issue**: Redirect URI mismatch
**Fix**: Update OAuth apps with actual Render URL

### Application Won't Start
**Issue**: Missing environment variables
**Fix**: Verify all 15 required variables are set

### Cold Starts (Free Tier)
**Issue**: First request takes 30-60 seconds
**Fix**: Upgrade to Starter plan or accept cold starts

---

## 💡 Pro Tips

1. **Database**: Use Neon's pooled connection for better performance
2. **Logs**: Monitor Render logs during first deployment
3. **Email**: Set `EMAIL_ENABLED=false` if you don't need email
4. **Testing**: Test locally with `prod` profile before deploying
5. **Secrets**: Never commit secrets to Git
6. **Backup**: Keep environment variables backed up securely

---

## 🔗 Important URLs

### After Deployment:
- **API Base**: `https://your-service.onrender.com`
- **Health Check**: `https://your-service.onrender.com/actuator/health`
- **API Docs**: `https://your-service.onrender.com/swagger-ui.html`
- **API JSON**: `https://your-service.onrender.com/api-docs`

### Dashboards:
- **Render**: https://dashboard.render.com
- **Neon DB**: https://console.neon.tech
- **Cloudinary**: https://cloudinary.com/console
- **Google Cloud**: https://console.cloud.google.com
- **GitHub Apps**: https://github.com/settings/developers

---

## 📞 Need Help?

1. Check **RENDER_DEPLOYMENT_GUIDE.md** for detailed instructions
2. Review **RENDER_DEPLOYMENT_CHECKLIST.md** for step-by-step guide
3. Check Render logs for error messages
4. Verify environment variables are set correctly
5. Test database connection separately

---

## 🎉 Success Criteria

Your deployment is successful when:
✅ Service shows "Live" status in Render
✅ Health endpoint returns `{"status":"UP"}`
✅ You can login with email/password
✅ OAuth login works (Google & GitHub)
✅ File uploads work
✅ No errors in logs

---

**Estimated Total Time**: 25-30 minutes
**Difficulty**: Intermediate
**Cost**: Free tier available (with limitations)

**Good luck with your deployment! 🚀**
