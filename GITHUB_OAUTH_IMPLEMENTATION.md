# GitHub OAuth Integration - Implementation Guide

## Overview
GitHub OAuth has been successfully integrated into your application, allowing users to sign in with their GitHub accounts. The implementation follows the same pattern as your existing Google OAuth integration.

## Credentials Used
- **Client ID**: `Ov23li4gxkGK900aEkLs`
- **Client Secret**: `8b46fd7029adb00c57b0015edd56652b2cd49b1c`
- **Redirect URI**: `http://localhost:5173/auth/github/callback` (for local development)

## What Was Implemented

### Backend Changes (Spring Boot)

#### 1. Configuration (`application.properties`)
Added GitHub OAuth2 configuration:
```properties
# GitHub OAuth2 Configuration
spring.security.oauth2.client.registration.github.client-id=Ov23li4gxkGK900aEkLs
spring.security.oauth2.client.registration.github.client-secret=8b46fd7029adb00c57b0015edd56652b2cd49b1c
spring.security.oauth2.client.registration.github.scope=user:email
spring.security.oauth2.client.registration.github.redirect-uri=${app.base-url}/auth/github/callback
```

#### 2. Auth Controller (`AuthController.java`)
Added new endpoint `/api/auth/github` that:
- Accepts an authorization code from GitHub
- Exchanges the code for an access token
- Retrieves user information from GitHub API
- Handles private email addresses by fetching from `/user/emails` endpoint
- Creates a new user if they don't exist
- Generates and returns a JWT token for your application

**Key Features:**
- Automatic user creation with `ROLE_STUDENT` by default
- Email verification is set to `true` for GitHub users (since GitHub verifies emails)
- Handles both public and private email scenarios
- Creates admin profiles if the user has admin role

### Frontend Changes (React/TypeScript)

#### 1. Auth Service (`authService.ts`)
Added `githubLogin()` method that sends the GitHub authorization code to the backend and handles the response.

#### 2. Auth Provider (`AuthProvider.tsx`)
Added `githubLogin()` method to the authentication context that:
- Calls the auth service
- Fetches user profile data
- Updates authentication state
- Handles onboarding flow

#### 3. GitHub Callback Page (`GitHubCallbackPage.tsx`)
New component that:
- Handles the redirect from GitHub
- Extracts the authorization code from URL parameters
- Processes authentication through the auth provider
- Redirects users to appropriate pages based on their role and onboarding status
- Displays loading state and error messages

#### 4. Login & Register Pages
Updated both pages with functional GitHub buttons that:
- Redirect users to GitHub's authorization page
- Include proper client ID and redirect URI
- Request `user:email` scope for accessing email addresses

#### 5. App Routes (`App.tsx`)
Added route for the GitHub callback: `/auth/github/callback`

## OAuth Flow

1. **User clicks "GitHub" button** on Login or Register page
2. **User is redirected to GitHub** authorization page:
   ```
   https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=user:email
   ```
3. **User authorizes the application** on GitHub
4. **GitHub redirects back** to your callback URL with an authorization code:
   ```
   http://localhost:5173/auth/github/callback?code=...
   ```
5. **Callback page extracts the code** and calls the auth provider
6. **Backend exchanges code for access token** with GitHub
7. **Backend fetches user information** from GitHub API
8. **Backend creates/logs in the user** and returns JWT token
9. **Frontend stores the JWT** and redirects based on user role/onboarding status

## How to Test

### Prerequisites
1. Make sure your backend is running on `http://localhost:8081`
2. Make sure your frontend is running on `http://localhost:5173`
3. Ensure the GitHub OAuth app is configured with the correct callback URL in GitHub's developer settings

### Testing Steps

1. **Start the Backend**:
   ```bash
   cd JavaSpringBootOAuth2JwtCrud
   ./mvnw spring-boot:run
   ```

2. **Start the Frontend**:
   ```bash
   cd ojtech-vite
   npm run dev
   ```

3. **Test Login Flow**:
   - Navigate to `http://localhost:5173/login`
   - Click the "GitHub" button
   - You'll be redirected to GitHub
   - Authorize the application
   - You should be redirected back and logged in
   - Check that you're redirected to the appropriate page based on your role

4. **Test Register Flow**:
   - Navigate to `http://localhost:5173/register`
   - Click the "GitHub" button
   - Same flow as login
   - New users will be created automatically

### What to Verify

- [ ] GitHub button redirects to GitHub authorization page
- [ ] After authorization, user is redirected back to your app
- [ ] User is successfully authenticated
- [ ] JWT token is stored in localStorage
- [ ] User is redirected to the correct page (onboarding for new users, dashboard for existing)
- [ ] User information is correctly retrieved from GitHub
- [ ] Email address is properly handled (including private emails)

## GitHub OAuth App Settings

Make sure your GitHub OAuth app has these settings:

1. **Application name**: Your app name
2. **Homepage URL**: `http://localhost:5173` (for development)
3. **Authorization callback URL**: `http://localhost:5173/auth/github/callback`

For production, you'll need to:
1. Update the redirect URI in GitHub OAuth app settings
2. Update the `GITHUB_REDIRECT_URI` in `LoginPage.tsx` and `RegisterPage.tsx`
3. Consider using environment variables for the client ID

## Environment Variables (Recommended for Production)

Instead of hardcoding credentials, create a `.env` file:

```env
# Frontend (.env in ojtech-vite folder)
VITE_GITHUB_CLIENT_ID=Ov23li4gxkGK900aEkLs
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

Then update the code to use:
```typescript
private GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23li4gxkGK900aEkLs';
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Client Secret**: The client secret is stored in `application.properties` which should **NEVER** be committed to a public repository. Use environment variables or secure configuration management for production.

2. **HTTPS**: In production, always use HTTPS for the redirect URI.

3. **Scope**: Currently requesting `user:email` scope. Only request what you need.

4. **Token Storage**: JWT tokens are stored in localStorage. Consider using httpOnly cookies for enhanced security in production.

## Troubleshooting

### Issue: "No authorization code received"
- Check that the redirect URI matches exactly in GitHub OAuth app settings
- Ensure there are no typos in the client ID

### Issue: "Unable to get email from GitHub"
- User might have all email addresses set to private
- The app correctly handles this by requesting the `/user/emails` endpoint
- Ensure the `user:email` scope is requested

### Issue: "Authentication service not available"
- Check that the backend is running
- Verify the API endpoint `/api/auth/github` is accessible
- Check browser console for CORS errors

### Issue: Backend error "Unable to get access token"
- Verify client secret in `application.properties`
- Check backend logs for detailed error messages
- Ensure the authorization code hasn't expired (they're single-use and expire quickly)

## Next Steps

1. **Test thoroughly** with different GitHub accounts
2. **Add error handling** for edge cases
3. **Monitor backend logs** for any authentication issues
4. **Update GitHub OAuth app settings** for production domains when deploying
5. **Move sensitive credentials** to environment variables
6. **Consider adding GitHub profile information** to the user profile (avatar, bio, etc.)

## Additional Features You Could Add

1. **GitHub Repository Integration**: Fetch and display user's repositories during onboarding
2. **GitHub Avatar**: Use GitHub profile picture as user avatar
3. **GitHub Stats**: Show GitHub contribution stats on user profile
4. **Two-Factor Authentication**: Support GitHub's 2FA
5. **Organization Memberships**: Fetch and verify organization memberships

## API Endpoints Reference

### Backend Endpoints
- **POST** `/api/auth/github` - Authenticate with GitHub code
  - Request: `{ "code": "authorization_code" }`
  - Response: JWT token and user data

### GitHub API Endpoints Used
- **POST** `https://github.com/login/oauth/access_token` - Exchange code for token
- **GET** `https://api.github.com/user` - Get user information
- **GET** `https://api.github.com/user/emails` - Get user email addresses (if primary is private)

## Files Modified

### Backend
- `JavaSpringBootOAuth2JwtCrud/src/main/resources/application.properties`
- `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/controller/AuthController.java`

### Frontend
- `ojtech-vite/src/lib/api/authService.ts`
- `ojtech-vite/src/providers/AuthProvider.tsx`
- `ojtech-vite/src/pages/LoginPage.tsx`
- `ojtech-vite/src/pages/RegisterPage.tsx`
- `ojtech-vite/src/pages/GitHubCallbackPage.tsx` (new file)
- `ojtech-vite/src/App.tsx`

---

**Documentation Date**: October 3, 2025
**Implementation Status**: ✅ Complete
**Tested**: Ready for testing

