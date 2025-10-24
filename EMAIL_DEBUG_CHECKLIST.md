# Email Not Received - Debug Checklist

## Quick Verification Steps

### 1. Check Console Logs
When creating a user, watch the backend console for:

**✅ Success Messages:**
```
✓ Brevo Email Service initialized with API key
✓ Verification email sent to: user@example.com
✓ Email sent successfully via Brevo API to: user@example.com
  Response: {"messageId":"..."}
```

**❌ Error Messages:**
```
✗ Failed to send verification email: [error message]
✗ Brevo API error: HTTP 401
  Response: {"code":"unauthorized","message":"Invalid API key"}
```

---

## Common Issues & Solutions

### Issue 1: Invalid Brevo API Key

**Symptom:** Error "HTTP 401" or "Invalid API key"

**Solution:**
1. Go to https://app.brevo.com/settings/keys/api
2. Copy your **v3 API Key** (starts with `xkeysib-`)
3. Update `application.properties`:
   ```properties
   brevo.api.key=xkeysib-YOUR-ACTUAL-API-KEY
   ```
4. Restart the application

---

### Issue 2: Sender Email Not Verified

**Symptom:** Error "HTTP 400" or "sender not verified"

**Solution:**
1. Go to https://app.brevo.com/senders
2. Check if `ojtech.team@gmail.com` is listed and verified
3. If not, add it and verify it (check Gmail for verification email)
4. Or update to a verified sender in `application.properties`:
   ```properties
   spring.mail.email=your-verified-email@domain.com
   ```

---

### Issue 3: Email Disabled

**Symptom:** Console shows "Email is disabled. Skipping user creation email"

**Solution:**
Check `application.properties`:
```properties
email.enabled=true  # Must be true
```

---

### Issue 4: Exception Caught Silently

**Check:** Look in AdminController logs for:
```
✗ Failed to send verification email: [error message]
```

Even if this appears, user creation should succeed but email won't be sent.

---

## Testing Email Service

### Test 1: Direct API Test

Create a test endpoint or use existing code:

```java
@GetMapping("/test-email")
public ResponseEntity<?> testEmail(@RequestParam String email) {
    try {
        emailService.sendTestEmail(email, "Test Subject", "This is a test email");
        return ResponseEntity.ok("Email sent! Check your inbox.");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Error: " + e.getMessage());
    }
}
```

### Test 2: Check Brevo Dashboard

1. Go to https://app.brevo.com/statistics/email
2. Check if any emails are being sent
3. Look at logs for delivery status

---

## Manual Brevo API Test

Test your API key manually:

### Using cURL:
```bash
curl -X POST https://api.brevo.com/v3/smtp/email \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR-BREVO-API-KEY" \
  -d '{
    "sender": {"email": "ojtech.team@gmail.com", "name": "OJTech"},
    "to": [{"email": "your-test-email@example.com"}],
    "subject": "Test Email",
    "htmlContent": "<html><body><h1>Test</h1></body></html>"
  }'
```

**Expected Response:**
- Success: `{"messageId":"<...>"}`
- Failure: Error message with details

---

## Configuration Checklist

### Current Configuration (application.properties):

```properties
# Email enabled?
email.enabled=true  ✓

# Brevo API Key (check if valid)
brevo.api.key=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

# Brevo API URL (correct)
brevo.api.url=https://api.brevo.com/v3/smtp/email  ✓

# Sender email (must be verified in Brevo)
spring.mail.email=ojtech.team@gmail.com  ⚠️ Check verification

# Backend URL for verification links
backend.base-url=http://localhost:8081  ✓ (for local dev)
```

---

## Debugging Code Changes

### Add More Detailed Logging

Update `AdminController.createUser()` method:

```java
// Send verification email with account credentials
try {
    System.out.println("🔄 Attempting to send email to: " + email);
    System.out.println("🔄 Username: " + username);
    System.out.println("🔄 User ID: " + user.getId().toString());
    
    emailService.sendUserCreationEmail(email, username, plainPassword, user.getId().toString());
    
    System.out.println("✓ Verification email sent to: " + email);
} catch (Exception emailException) {
    System.err.println("✗ Failed to send verification email: " + emailException.getMessage());
    emailException.printStackTrace(); // Print full stack trace
    // Don't fail user creation if email fails - just log it
}
```

---

## Expected Flow

1. **Admin creates user** → POST `/api/admin/users`
2. **User saved to DB** → User object created with ID
3. **Email service called** → `emailService.sendUserCreationEmail()`
4. **Brevo API called** → HTTP POST to `https://api.brevo.com/v3/smtp/email`
5. **Email sent** → Brevo returns `messageId`
6. **User receives email** → Check inbox (and spam folder!)

---

## Quick Fixes

### Fix 1: Verify Brevo API Key
```bash
# Go to: https://app.brevo.com/settings/keys/api
# Copy the API key and update application.properties
```

### Fix 2: Verify Sender Email
```bash
# Go to: https://app.brevo.com/senders
# Verify ojtech.team@gmail.com or add a new sender
```

### Fix 3: Check Spam Folder
Sometimes emails from new senders go to spam. Check the spam/junk folder!

### Fix 4: Test with Different Email
Try creating a user with a different email provider (Gmail, Outlook, Yahoo, etc.)

---

## Still Not Working?

1. **Restart the application** after changing `application.properties`
2. **Check Brevo account status** - ensure it's active and not suspended
3. **Check Brevo sending limits** - free tier has daily limits
4. **Review Brevo logs** at https://app.brevo.com/logs/email
5. **Try a simpler test email** first using the test endpoint

---

## Support

If still facing issues:
1. Share the console logs (look for ✓ or ✗ messages)
2. Check Brevo dashboard for error logs
3. Verify API key is correct
4. Ensure sender email is verified
