# Email Debugging Guide - Enhanced Logging

## Changes Made

I've added comprehensive debugging logs throughout the email sending process to help identify why emails aren't being received.

### Files Modified:

1. **EmailService.java** - Added detailed logging to `sendUserCreationEmail()`
2. **BrevoEmailService.java** - Added API call debugging
3. **AdminController.java** - Enhanced user creation logging + test endpoint

---

## Testing Steps

### Step 1: Restart the Application

**IMPORTANT:** After making these changes, you MUST restart the Spring Boot application for the logs to take effect.

### Step 2: Create a Test User

Try creating a user via the admin panel and watch the console output carefully.

### Expected Console Output (Success):

```
🔄 Attempting to send verification email...
   Email: test@example.com
   Username: testuser
   User ID: abc-123-def-456

📧 sendUserCreationEmail called
   To: test@example.com
   Username: testuser
   User ID: abc-123-def-456
   Email Enabled: true
   Verification URL: http://localhost:8081/api/auth/verifyEmail/abc-123-def-456
   Base URL: http://localhost:8081

📤 Calling Brevo API to send email...

🔧 BrevoEmailService.sendEmail() called
   To: test@example.com
   Subject: Your OJTech Account Has Been Created
   API URL: https://api.brevo.com/v3/smtp/email
   API Key: xkeysib-198f8525ae8...

🔨 Building email request...
   From Email: ojtech.team@gmail.com

📨 Sending request to Brevo API...
   Request size: 2345 bytes

✓ Email sent successfully via Brevo API to: test@example.com
  Response: {"messageId":"<abc@smtp-brevo.com>"}

✅ User creation email sent successfully to: test@example.com
✓ Verification email sent successfully to: test@example.com
```

### Expected Console Output (Failure):

```
🔄 Attempting to send verification email...
   Email: test@example.com
   Username: testuser
   User ID: abc-123-def-456

📧 sendUserCreationEmail called
   To: test@example.com
   Username: testuser
   User ID: abc-123-def-456
   Email Enabled: true
   Verification URL: http://localhost:8081/api/auth/verifyEmail/abc-123-def-456
   Base URL: http://localhost:8081

📤 Calling Brevo API to send email...

🔧 BrevoEmailService.sendEmail() called
   To: test@example.com
   Subject: Your OJTech Account Has Been Created
   API URL: https://api.brevo.com/v3/smtp/email
   API Key: xkeysib-198f8525ae8...

🔨 Building email request...
   From Email: ojtech.team@gmail.com

📨 Sending request to Brevo API...
   Request size: 2345 bytes

✗ Brevo API error: HTTP 401
  Response: {"code":"unauthorized","message":"Invalid API key"}

❌ ERROR sending user creation email:
   Error: Failed to send email via Brevo API: HTTP 401 - {"code":"unauthorized","message":"Invalid API key"}
[Stack trace...]

✗ Failed to send verification email: Failed to send email via Brevo API: HTTP 401 - {"code":"unauthorized","message":"Invalid API key"}
```

---

## Common Error Messages & Solutions

### Error 1: "Invalid API key" (HTTP 401)

**Problem:** Brevo API key is incorrect or expired

**Solution:**
1. Go to https://app.brevo.com/settings/keys/api
2. Copy your **v3 API Key**
3. Update `application.properties`:
   ```properties
   brevo.api.key=xkeysib-YOUR-ACTUAL-KEY-HERE
   ```
4. Restart the application

### Error 2: "Sender not verified" (HTTP 400)

**Problem:** The sender email (`ojtech.team@gmail.com`) is not verified in Brevo

**Solution:**
1. Go to https://app.brevo.com/senders
2. Check if `ojtech.team@gmail.com` is verified
3. If not, click "Add a sender" and verify it
4. Or change to a verified email in `application.properties`:
   ```properties
   spring.mail.email=your-verified-email@example.com
   ```

### Error 3: "Email is disabled" 

**Problem:** Email sending is turned off in configuration

**Solution:**
Check `application.properties`:
```properties
email.enabled=true  # Must be true
```

### Error 4: No error but no email received

**Possible causes:**
1. **Email went to spam** - Check spam/junk folder
2. **Brevo free tier limits reached** - Check https://app.brevo.com/statistics
3. **Email blocked by provider** - Try a different email address
4. **Delayed delivery** - Wait 5-10 minutes and check again

---

## Using the Test Email Endpoint

### Quick Email Test

Use the test endpoint to verify email configuration without creating a user:

**Request:**
```http
GET http://localhost:8081/api/admin/test-email?email=your-email@example.com
```

**Success Response:**
```json
{
  "message": "Test email sent! Check inbox for: your-email@example.com"
}
```

**Console Output:**
```
🧪 Testing email service...
   Recipient: your-email@example.com

🔧 BrevoEmailService.sendEmail() called
   To: your-email@example.com
   Subject: OJTech - Email Test
   ...

✓ Test email sent successfully!
```

---

## Debugging Checklist

Run through this checklist step-by-step:

- [ ] **Application restarted** after code changes
- [ ] **Email enabled** in `application.properties` (`email.enabled=true`)
- [ ] **Brevo API key** is valid and correct
- [ ] **Sender email** (`spring.mail.email`) is verified in Brevo dashboard
- [ ] **Backend URL** is correct in `application.properties` (`backend.base-url`)
- [ ] **Test endpoint** works: `/api/admin/test-email?email=YOUR_EMAIL`
- [ ] **Console shows** detailed logs when creating user
- [ ] **No exceptions** in console output
- [ ] **Checked spam folder** in email client
- [ ] **Brevo dashboard** shows email was sent (https://app.brevo.com/statistics)

---

## What the Logs Tell You

### 🔄 "Attempting to send verification email..."
- Email sending process has started
- Shows the email address, username, and user ID

### 📧 "sendUserCreationEmail called"
- EmailService method was invoked
- Shows if email is enabled
- Shows the verification URL that will be in the email

### 🔧 "BrevoEmailService.sendEmail() called"
- Brevo API service is being used
- Shows API URL and partial API key (for security)

### 🔨 "Building email request..."
- Shows the sender email being used
- This must match a verified sender in Brevo

### 📨 "Sending request to Brevo API..."
- Request is being sent to Brevo servers
- Shows request size

### ✓ "Email sent successfully via Brevo API"
- Email was accepted by Brevo
- Shows messageId from Brevo
- **This means Brevo received it, check spam folder!**

### ✗ "Brevo API error"
- Something went wrong with Brevo API
- HTTP code indicates the error type:
  - **401**: Invalid API key
  - **400**: Bad request (usually sender not verified)
  - **403**: Forbidden (account issue)
  - **429**: Rate limit exceeded

---

## Configuration Verification

### Current Configuration Check

Your `application.properties` should have:

```properties
# Email Configuration
email.enabled=true

# Brevo API Configuration
brevo.api.key=xkeysib-[YOUR-KEY-HERE]
brevo.api.url=https://api.brevo.com/v3/smtp/email

# Verified sender email address
spring.mail.email=ojtech.team@gmail.com

# Application Base URL
backend.base-url=http://localhost:8081
```

### Verify Each Value:

1. **email.enabled** = `true` ✓
2. **brevo.api.key** = Valid API key from Brevo dashboard
3. **brevo.api.url** = `https://api.brevo.com/v3/smtp/email` ✓
4. **spring.mail.email** = Verified sender email in Brevo
5. **backend.base-url** = Your backend URL (for verification links)

---

## Next Steps

1. **Restart your application**
2. **Create a test user** or use the test endpoint
3. **Watch the console output** carefully
4. **Copy the exact error message** if there is one
5. **Check your Brevo dashboard** at https://app.brevo.com/statistics/email

If you see errors, paste the console output here so I can help diagnose the specific issue!

---

## Brevo Dashboard Checks

### Check 1: API Keys
https://app.brevo.com/settings/keys/api
- Verify your API key is active
- Copy the correct v3 API key

### Check 2: Senders
https://app.brevo.com/senders
- Verify `ojtech.team@gmail.com` is listed and verified
- Green checkmark means verified ✓

### Check 3: Email Statistics
https://app.brevo.com/statistics/email
- Shows if emails are being sent
- Shows delivery status
- Shows any errors or bounces

### Check 4: Logs
https://app.brevo.com/logs/email
- Real-time log of all API calls
- Shows success/failure for each email
- Helpful for debugging

---

## Contact Points for Debugging

When reporting issues, please provide:

1. **Console output** from creating a user (copy the full log)
2. **Error messages** (if any)
3. **Brevo dashboard** status (any errors shown?)
4. **Email provider** you're testing with (Gmail, Outlook, etc.)
5. **Spam folder** checked? (Yes/No)

This will help identify the exact issue quickly!
