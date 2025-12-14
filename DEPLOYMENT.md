# OJTech Deployment Guide

This guide covers deploying the OJTech platform to production:
- **Frontend**: Netlify (recommended for React/Vite apps)
- **Backend**: Digital Ocean Droplet (Ubuntu Linux)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment - Netlify](#frontend-deployment---netlify)
3. [Backend Deployment - Digital Ocean Droplet](#backend-deployment---digital-ocean-droplet)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### General Requirements
- Domain name (optional but recommended)
- GitHub account (for Netlify CI/CD)
- Digital Ocean account
- PostgreSQL database (can be on Digital Ocean or external service)

### Accounts & Services
- [ ] Netlify account (free tier available)
- [ ] Digital Ocean account
- [ ] Cloudinary account (for file storage)
- [ ] Brevo account (for email services)
- [ ] Google Cloud Console (for OAuth)
- [ ] Domain registrar access (if using custom domain)

---

## Frontend Deployment - Netlify

### Option 1: Deploy via Netlify UI (Recommended)

#### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub:
   ```bash
   cd ojtech-vite
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. Ensure your `vite.config.ts` is production-ready:
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
     build: {
       outDir: 'dist',
       sourcemap: false,
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom', 'react-router-dom'],
           },
         },
       },
     },
   })
   ```

#### Step 2: Create Netlify Site

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to your GitHub account
4. Select your `ojtech-rewritten` repository
5. Configure build settings:
   - **Base directory**: `ojtech-vite`
   - **Build command**: `npm run build`
   - **Publish directory**: `ojtech-vite/dist`
   - **Node version**: 18 or higher

#### Step 3: Configure Environment Variables

In Netlify dashboard → **Site settings** → **Environment variables**, add:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

#### Step 4: Configure Redirects

Create `ojtech-vite/public/_redirects` file for client-side routing:

```
# Redirects for client-side routing
/*    /index.html   200
```

Or create `ojtech-vite/netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at `https://your-site-name.netlify.app`

#### Step 6: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS records
4. SSL certificate will be automatically provisioned

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd ojtech-vite

# Initialize Netlify site
netlify init

# Deploy to production
netlify deploy --prod
```

---

## Backend Deployment - Digital Ocean Droplet

### Step 1: Create a Droplet

1. Log in to [Digital Ocean](https://cloud.digitalocean.com/)
2. Click **"Create"** → **"Droplets"**
3. Choose configuration:
   - **Image**: Ubuntu 24.04 LTS x64
   - **Plan**: Basic (2GB RAM minimum recommended)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH key (recommended) or password
   - **Hostname**: `ojtech-api` or similar

4. Click **"Create Droplet"**
5. Note your droplet's IP address

### Step 2: Initial Server Setup

SSH into your droplet:

```bash
ssh root@your_droplet_ip
```

#### Update System

```bash
# Update package list
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git vim ufw
```

#### Create a Non-Root User

```bash
# Create new user
adduser ojtech

# Add to sudo group
usermod -aG sudo ojtech

# Switch to new user
su - ojtech
```

#### Configure Firewall

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow your backend port (8081)
sudo ufw allow 8081/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### Step 3: Install Java 21

```bash
# Install Java 21
sudo apt install -y openjdk-21-jdk

# Verify installation
java -version
```

### Step 4: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE ojtech;
CREATE USER ojtechuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ojtech TO ojtechuser;
ALTER DATABASE ojtech OWNER TO ojtechuser;
\q
```

#### Configure PostgreSQL for Remote Access (if needed)

```bash
# Edit postgresql.conf
sudo vim /etc/postgresql/16/main/postgresql.conf
# Change: listen_addresses = 'localhost' to listen_addresses = '*'

# Edit pg_hba.conf
sudo vim /etc/postgresql/16/main/pg_hba.conf
# Add: host    all    all    0.0.0.0/0    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 5: Deploy the Application

#### Clone or Upload Your Code

**Option A: Clone from Git**

```bash
cd /home/ojtech
git clone https://github.com/your-username/ojtech-rewritten.git
cd ojtech-rewritten/JavaSpringBootOAuth2JwtCrud
```

**Option B: Upload via SCP (from your local machine)**

```bash
# From your local machine
cd /path/to/ojtech-rewritten/JavaSpringBootOAuth2JwtCrud
./mvnw clean package -DskipTests

# Upload JAR file
scp target/ojtech-api-0.0.1-SNAPSHOT.jar ojtech@your_droplet_ip:/home/ojtech/
```

#### Create Environment File

```bash
cd /home/ojtech/JavaSpringBootOAuth2JwtCrud
vim .env
```

Add your production environment variables:

```env
# Server Configuration
PORT=8081
SERVER_ADDRESS=0.0.0.0

# Database Configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/ojtech
DATABASE_USERNAME=ojtechuser
DATABASE_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_long_production_jwt_secret_key_minimum_256_bits
JWT_EXPIRATION_MS=86400000

# OAuth2 - Google
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# OAuth2 - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_PRESET=OJTECHPDF

# Email Configuration
EMAIL_ENABLED=true
BREVO_API_KEY=your_production_brevo_api_key
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
SPRING_MAIL_EMAIL=your_verified_sender@domain.com

# Frontend URL
FRONTEND_URL=https://your-netlify-site.netlify.app
BACKEND_URL=https://your-backend-domain.com
```

#### Build the Application (if cloned)

```bash
cd /home/ojtech/JavaSpringBootOAuth2JwtCrud

# Build with Maven
./mvnw clean package -DskipTests
```

### Step 6: Create Systemd Service

Create a service file to run the application as a background service:

```bash
sudo vim /etc/systemd/system/ojtech-api.service
```

Add the following content:

```ini
[Unit]
Description=OJTech Spring Boot API
After=postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=ojtech
Group=ojtech
WorkingDirectory=/home/ojtech/JavaSpringBootOAuth2JwtCrud
ExecStart=/usr/bin/java -jar /home/ojtech/JavaSpringBootOAuth2JwtCrud/target/ojtech-api-0.0.1-SNAPSHOT.jar
EnvironmentFile=/home/ojtech/JavaSpringBootOAuth2JwtCrud/.env
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ojtech-api

[Install]
WantedBy=multi-user.target
```

#### Enable and Start the Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable ojtech-api

# Start the service
sudo systemctl start ojtech-api

# Check status
sudo systemctl status ojtech-api

# View logs
sudo journalctl -u ojtech-api -f
```

### Step 7: Install and Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo vim /etc/nginx/sites-available/ojtech-api
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/ojtech-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Post-Deployment Configuration

### 1. Configure Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/):

1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add **Authorized JavaScript origins**:
   - `https://your-netlify-site.netlify.app`
   - `https://your-custom-domain.com` (if using custom domain)

4. Add **Authorized redirect URIs**:
   - `https://your-netlify-site.netlify.app/auth/callback`
   - `https://your-backend-domain.com/oauth2/callback/google`

### 2. Update CORS Configuration

Ensure your backend allows requests from your frontend domain. This should already be configured via the `FRONTEND_URL` environment variable.

### 3. Test the Deployment

1. Visit your Netlify site
2. Try to register/login
3. Test Google OAuth
4. Test job posting and application features
5. Verify email notifications work
6. Test file uploads

---

## SSL/HTTPS Setup

### For Backend (Nginx + Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx
- Set up auto-renewal

### For Frontend (Netlify)

SSL is automatically enabled by Netlify for both:
- `*.netlify.app` domains (automatic)
- Custom domains (automatic after DNS verification)

---

## Monitoring & Maintenance

### View Application Logs

```bash
# Real-time logs
sudo journalctl -u ojtech-api -f

# Last 100 lines
sudo journalctl -u ojtech-api -n 100

# Logs from today
sudo journalctl -u ojtech-api --since today
```

### Restart Application

```bash
sudo systemctl restart ojtech-api
```

### Update Application

```bash
cd /home/ojtech/JavaSpringBootOAuth2JwtCrud
git pull origin main
./mvnw clean package -DskipTests
sudo systemctl restart ojtech-api
```

### Database Backup

```bash
# Create backup script
vim ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ojtech/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U ojtechuser ojtech > $BACKUP_DIR/ojtech_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
```

```bash
chmod +x ~/backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/ojtech/backup-db.sh
```

---

## Troubleshooting

### Frontend Issues

**Build fails on Netlify:**
- Check Node version (18+ required)
- Verify all dependencies are in `package.json`
- Check build logs in Netlify dashboard
- Ensure environment variables are set

**404 on page refresh:**
- Add `_redirects` file or `netlify.toml` for SPA routing
- Check publish directory is set to `ojtech-vite/dist`

**API connection fails:**
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings on backend
- Ensure backend is running and accessible

### Backend Issues

**Application won't start:**
```bash
# Check service status
sudo systemctl status ojtech-api

# View detailed logs
sudo journalctl -u ojtech-api -n 50 --no-pager

# Check if port is already in use
sudo lsof -i :8081

# Check Java installation
java -version
```

**Database connection fails:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U ojtechuser -d ojtech -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

**502 Bad Gateway (Nginx):**
- Verify application is running: `sudo systemctl status ojtech-api`
- Check Nginx configuration: `sudo nginx -t`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

**Out of memory:**
```bash
# Check system resources
free -h
df -h

# Adjust JVM memory in service file
ExecStart=/usr/bin/java -Xmx512m -Xms256m -jar /path/to/app.jar
```

**SSL certificate issues:**
```bash
# Renew certificates manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Common Environment Variable Issues

**Variables not loading:**
- Ensure `.env` file exists in the correct directory
- Check file permissions: `chmod 600 .env`
- Verify EnvironmentFile path in systemd service
- Restart service after changing variables

---

## Performance Optimization

### Backend Optimization

1. **Enable JVM optimizations:**
   ```bash
   # In systemd service file
   ExecStart=/usr/bin/java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -jar app.jar
   ```

2. **Database connection pooling** (already configured in Spring Boot)

3. **Enable caching** (Redis/Caffeine if needed)

### Frontend Optimization

1. Already configured in Vite:
   - Code splitting
   - Tree shaking
   - Minification

2. **Enable compression in Nginx:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   gzip_min_length 1000;
   ```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (256+ bits)
- [ ] Enable UFW firewall
- [ ] Configure fail2ban (optional)
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS settings
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Restrict PostgreSQL access
- [ ] Use SSH keys instead of passwords

---

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Digital Ocean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Spring Boot Deployment Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Support

For issues specific to deployment, check:
1. Application logs: `sudo journalctl -u ojtech-api -f`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-16-main.log`
4. System logs: `sudo journalctl -xe`

For platform-specific issues:
- Netlify: [Support Forum](https://answers.netlify.com/)
- Digital Ocean: [Community Tutorials](https://www.digitalocean.com/community)
