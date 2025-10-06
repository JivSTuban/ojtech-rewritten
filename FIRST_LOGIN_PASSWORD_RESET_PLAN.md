# First Login Password Reset Implementation Plan

## Overview
Implement mandatory password reset for admin and employer users on their first login. When logging in with seeded credentials from `DatabaseSeeder.java`, these users must reset their password before accessing the system.

---

## Backend Implementation

### 1. Database Schema Changes

#### 1.1 Add Field to User Entity
**File:** `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/User.java`

Add a new field to track if password reset is required:
```java
@Column(name = "requires_password_reset")
private boolean requiresPasswordReset = false;
```

**Reasoning:** 
- Simple boolean flag to track password reset requirement
- Defaults to `false` for new OAuth users and regular registrations
- Will be set to `true` for seeded admin/employer accounts

#### 1.2 Add Getter/Setter Methods
```java
public boolean isRequiresPasswordReset() {
    return requiresPasswordReset;
}

public void setRequiresPasswordReset(boolean requiresPasswordReset) {
    this.requiresPasswordReset = requiresPasswordReset;
}
```

---

### 2. Update JwtResponse DTO

**File:** `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/dtos/responses/JwtResponse.java`

#### 2.1 Add Field
```java
private boolean requiresPasswordReset;
```

#### 2.2 Update Constructors
```java
public JwtResponse(String token, UUID id, String username, String email, 
                   List<String> roles, boolean hasCompletedOnboarding, 
                   boolean requiresPasswordReset) {
    this.token = token;
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.hasCompletedOnboarding = hasCompletedOnboarding;
    this.requiresPasswordReset = requiresPasswordReset;
}
```

#### 2.3 Add Getter/Setter
```java
public boolean isRequiresPasswordReset() {
    return requiresPasswordReset;
}

public void setRequiresPasswordReset(boolean requiresPasswordReset) {
    this.requiresPasswordReset = requiresPasswordReset;
}
```

**Reasoning:** 
- Frontend needs to know if password reset is required immediately after login
- Include this info in the JWT response to avoid additional API calls

---

### 3. Update DatabaseSeeder

**File:** `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/seeds/DatabaseSeeder.java`

#### 3.1 Modify Admin User Creation (Line 138-143)
```java
User adminUser = new User("admin", "admin@ojtech.com", passwordEncoder.encode("password"));
Role adminRole = getOrCreateRole(ERole.ROLE_ADMIN);
adminUser.getRoles().add(adminRole);
adminUser.setEmailVerified(true);
adminUser.setRequiresPasswordReset(true); // ADD THIS LINE
userRepository.save(adminUser);
```

#### 3.2 Modify Employer User Creation (Line 169-173)
```java
User employerUser = new User("employer", "employer@ojtech.com", passwordEncoder.encode("password"));
employerUser.setEmailVerified(true);
Role employerRole = getOrCreateRole(ERole.ROLE_EMPLOYER);
employerUser.getRoles().add(employerRole);
employerUser.setRequiresPasswordReset(true); // ADD THIS LINE
userRepository.save(employerUser);
```

#### 3.3 Keep Student Users Unchanged
Student users should NOT require password reset (they're test accounts).

**Reasoning:**
- Admin and employer accounts often have elevated privileges
- Security best practice to force password change on first login
- Students are considered regular users for testing purposes

---

### 4. Update Authentication Logic

**File:** `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/controller/AuthController.java`

#### 4.1 Modify Login Response (Around line 220-240)
```java
// Check if user has completed onboarding AND requires password reset
boolean hasCompletedOnboarding = false;
boolean requiresPasswordReset = false;

try {
    User user = userRepository.findById(userDetails.getId())
            .orElse(null);
    
    if (user != null) {
        // Check password reset requirement
        requiresPasswordReset = user.isRequiresPasswordReset();
        
        // Check onboarding status
        if (user.getProfile() != null) {
            hasCompletedOnboarding = user.getProfile().isHasCompletedOnboarding();
        }
    }
} catch (Exception e) {
    System.out.println("Error checking user status: " + e.getMessage());
}

// Return JWT response with password reset flag
return ResponseEntity.ok(
    new JwtResponse(jwt,
        userDetails.getId(),
        userDetails.getUsername(),
        userDetails.getEmail(),
        roles,
        hasCompletedOnboarding,
        requiresPasswordReset) // ADD THIS PARAMETER
);
```

**Reasoning:**
- Check password reset requirement during login
- Return this information to frontend for immediate action
- Don't block login, but inform frontend to redirect

---

### 5. Create Password Reset Endpoint

**File:** `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/controller/AuthController.java`

#### 5.1 Create DTO for Password Change Request
Create new file: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/dtos/requests/ChangePasswordRequest.java`

```java
package com.melardev.spring.jwtoauth.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {
    
    @NotBlank(message = "Current password is required")
    private String currentPassword;
    
    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
    private String newPassword;
    
    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;
    
    // Getters and setters
    public String getCurrentPassword() {
        return currentPassword;
    }
    
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
    
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
```

#### 5.2 Add Change Password Endpoint
In `AuthController.java`, add this method:

```java
@PostMapping("/change-password")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
    try {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("New password and confirmation do not match"));
        }
        
        // Find user
        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("User not found"));
        }
        
        User user = userOpt.get();
        
        // Verify current password (skip for OAuth users or if they're doing first-time reset)
        if (user.getProvider() == null || user.getProvider().isEmpty()) {
            if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Current password is incorrect"));
            }
        }
        
        // Validate new password is different from current
        if (encoder.matches(request.getNewPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("New password must be different from current password"));
        }
        
        // Update password
        user.setPassword(encoder.encode(request.getNewPassword()));
        
        // Clear password reset flag
        user.setRequiresPasswordReset(false);
        
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
        
    } catch (Exception e) {
        logger.error("Error changing password", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new MessageResponse("Error changing password: " + e.getMessage()));
    }
}
```

**Reasoning:**
- Authenticated endpoint - user must be logged in
- Validates current password to prevent unauthorized changes
- Ensures new password is different from old one
- Clears the `requiresPasswordReset` flag after successful change
- Returns appropriate error messages for validation failures

---

### 6. Update Security Configuration

**File:** `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/config/SecurityConfig.java`

Ensure the `/api/auth/change-password` endpoint is accessible to authenticated users:

```java
.requestMatchers("/api/auth/change-password").authenticated()
```

**Reasoning:**
- Only authenticated users should be able to change their password
- This is already covered by `@PreAuthorize("isAuthenticated()")` but good to be explicit

---

## Frontend Implementation

### 7. Update TypeScript Interfaces

**File:** `ojtech-vite/src/lib/api/authService.ts`

#### 7.1 Update UserData Interface
```typescript
export interface UserData {
  id: number;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
  hasCompletedOnboarding?: boolean;
  requiresPasswordReset?: boolean; // ADD THIS
}
```

#### 7.2 Add Change Password Request Interface
```typescript
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

#### 7.3 Add Change Password Function
```typescript
const changePassword = async (data: ChangePasswordRequest) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const response = await axios.post(
      `${AUTH_API_URL}/change-password`, 
      data,
      {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Change password error:', error);
    throw error;
  }
};
```

#### 7.4 Export the Function
```typescript
const authService = {
  register,
  login,
  googleLogin,
  githubLogin,
  logout,
  getCurrentUser,
  checkAuthStatus,
  changePassword, // ADD THIS
};
```

---

### 8. Update AuthProvider State

**File:** `ojtech-vite/src/providers/AuthProvider.tsx`

#### 8.1 Add requiresPasswordReset to State
```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  requiresPasswordReset: boolean; // ADD THIS
  login: (usernameOrEmail: string, password: string) => Promise<any>;
  googleLogin: (tokenId: string) => Promise<any>;
  githubLogin: (code: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (profile: any) => void;
}
```

#### 8.2 Initialize in State
```typescript
state: AuthProviderState = {
  isAuthenticated: false,
  user: null,
  profile: null,
  isLoading: true,
  needsOnboarding: false,
  requiresPasswordReset: false, // ADD THIS
};
```

#### 8.3 Update Login Method
```typescript
login = async (usernameOrEmail: string, password: string) => {
  try {
    this.setState({ isLoading: true });
    const baseUserData = await authService.login({
      usernameOrEmail,
      password,
    });

    console.log('Login successful, fetching user profile');
    const fullUser = await this.fetchUserProfileData(baseUserData);

    // Check onboarding status
    const hasCompletedOnboarding = fullUser.hasCompletedOnboarding === true;
    
    // Check password reset requirement
    const requiresPasswordReset = fullUser.requiresPasswordReset === true;
    
    console.log('Login complete. Onboarding:', hasCompletedOnboarding, 'Password Reset:', requiresPasswordReset);

    this.setState({
      isLoading: false,
      isAuthenticated: true,
      user: fullUser,
      profile: fullUser.profile,
      needsOnboarding: !hasCompletedOnboarding,
      requiresPasswordReset: requiresPasswordReset, // ADD THIS
    });

    return fullUser;
  } catch (error: any) {
    this.setState({ isLoading: false });
    throw error;
  }
};
```

#### 8.4 Update Context Value Export
```typescript
<AuthContext.Provider
  value={{
    isAuthenticated: this.state.isAuthenticated,
    user: this.state.user,
    profile: this.state.profile,
    isLoading: this.state.isLoading,
    needsOnboarding: this.state.needsOnboarding,
    requiresPasswordReset: this.state.requiresPasswordReset, // ADD THIS
    login: this.login,
    googleLogin: this.googleLogin,
    githubLogin: this.githubLogin,
    logout: this.logout,
    checkAuth: this.checkAuth,
    updateProfile: this.updateProfile,
  }}
>
```

---

### 9. Create Password Reset Page

**File:** `ojtech-vite/src/pages/ChangePasswordPage.tsx`

```typescript
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Loader2, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import authService from '../lib/api/authService';
import { toast } from '../components/ui/toast-utils';

interface ChangePasswordPageState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  redirectTo: string | null;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong' | null;
}

export class ChangePasswordPage extends Component<{}, ChangePasswordPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  state: ChangePasswordPageState = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
    redirectTo: null,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    passwordStrength: null,
  };

  componentDidMount() {
    // If user doesn't require password reset, redirect based on role
    if (this.context && !this.context.requiresPasswordReset) {
      this.redirectBasedOnRole();
    }
  }

  redirectBasedOnRole = () => {
    const { user } = this.context;
    if (user && user.roles) {
      if (user.roles.includes('ROLE_ADMIN')) {
        this.setState({ redirectTo: '/admin/dashboard' });
      } else if (user.roles.includes('ROLE_EMPLOYER')) {
        this.setState({ redirectTo: '/employer/dashboard' });
      } else {
        this.setState({ redirectTo: '/dashboard' });
      }
    }
  };

  checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    this.setState({
      newPassword,
      passwordStrength: newPassword ? this.checkPasswordStrength(newPassword) : null,
    });
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = this.state;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.setState({ error: 'All fields are required' });
      toast.destructive({
        title: 'Validation Error',
        description: 'Please fill in all fields',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      this.setState({ error: 'New password must be at least 6 characters' });
      toast.destructive({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      toast.destructive({
        title: 'Validation Error',
        description: 'New password and confirmation do not match',
      });
      return;
    }
    
    if (currentPassword === newPassword) {
      this.setState({ error: 'New password must be different from current password' });
      toast.destructive({
        title: 'Validation Error',
        description: 'New password must be different from current password',
      });
      return;
    }
    
    this.setState({ isLoading: true, error: null });
    
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      toast.success({
        title: 'Password Changed',
        description: 'Your password has been successfully updated',
      });
      
      // Update auth context to clear requiresPasswordReset flag
      if (this.context && this.context.user) {
        const updatedUser = { ...this.context.user, requiresPasswordReset: false };
        this.context.updateProfile(updatedUser);
      }
      
      // Redirect based on role
      this.redirectBasedOnRole();
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      this.setState({ error: errorMessage, isLoading: false });
      toast.destructive({
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  render() {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      isLoading,
      error,
      redirectTo,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordStrength,
    } = this.state;

    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    const { user } = this.context;
    const isFirstLogin = user?.requiresPasswordReset;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {isFirstLogin ? 'Set New Password' : 'Change Password'}
            </h2>
            {isFirstLogin && (
              <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    For security reasons, you must change your password before accessing the system.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={this.handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => this.setState({ currentPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => this.setState({ showCurrentPassword: !showCurrentPassword })}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={this.handleNewPasswordChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => this.setState({ showNewPassword: !showNewPassword })}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 'weak'
                            ? 'w-1/3 bg-red-500'
                            : passwordStrength === 'medium'
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength === 'weak'
                          ? 'text-red-600 dark:text-red-400'
                          : passwordStrength === 'medium'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                </div>
              )}
              
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use at least 8 characters with a mix of letters, numbers, and symbols
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => this.setState({ confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => this.setState({ showConfirmPassword: !showConfirmPassword })}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (confirmPassword && newPassword !== confirmPassword)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }
}
```

---

### 10. Update Login Page Redirect Logic

**File:** `ojtech-vite/src/pages/LoginPage.tsx`

#### 10.1 Update handleSubmit Method (Around line 150-170)
```typescript
handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const { email, password } = this.state;
  
  if (!this.context || !this.context.login) {
    toast.destructive({
      title: "Authentication Error",
      description: "Authentication service not available"
    });
    this.setState({ error: "Authentication service not available" });
    return;
  }
  
  const { login } = this.context;
  
  this.setState({ error: null, isLoading: true });
  
  try {
    await login(email, password);
    
    toast.success({
      title: "Login Successful",
      description: "You have been successfully logged in."
    });
    
    // After successful login, try to create initial profile if needed
    await this.createInitialProfileIfNeeded();
    
    // Check if user requires password reset - PRIORITY CHECK
    if (this.context.requiresPasswordReset) {
      this.setState({ redirectTo: '/change-password', isLoading: false });
      return;
    }
    
    // Then check onboarding status
    if (this.context.needsOnboarding) {
      this.setState({ redirectTo: '/onboarding', isLoading: false });
      return;
    }
    
    // Check user role and determine where to redirect
    const user = this.context.user;
    if (user && user.roles) {
      if (user.roles.includes('ROLE_ADMIN')) {
        this.setState({ redirectTo: '/admin/dashboard', isLoading: false });
      } else if (user.roles.includes('ROLE_EMPLOYER')) {
        this.setState({ redirectTo: '/employer/dashboard', isLoading: false });
      } else if (user.roles.includes('ROLE_STUDENT')) {
        this.setState({ redirectTo: '/dashboard', isLoading: false });
      } else {
        this.setState({ redirectTo: '/dashboard', isLoading: false });
      }
    } else {
      this.setState({ redirectTo: '/dashboard', isLoading: false });
    }
  } catch (error: any) {
    // ... existing error handling
  }
};
```

**Reasoning:**
- Password reset check takes priority over onboarding
- Ensures users can't bypass password reset
- Maintains existing onboarding flow

---

### 11. Add Route for Password Change Page

**File:** `ojtech-vite/src/App.tsx`

#### 11.1 Import the Component
```typescript
import { ChangePasswordPage } from './pages/ChangePasswordPage';
```

#### 11.2 Add Route (in the authenticated routes section)
```typescript
{/* Password change route - should be accessible to all authenticated users */}
<Route 
  path="/change-password" 
  element={<ChangePasswordPage />} 
/>
```

**Reasoning:**
- Accessible to all authenticated users
- No special route protection needed as the page itself checks context
- Should be placed before other protected routes

---

### 12. Create Protected Route Guard (Optional Enhancement)

**File:** `ojtech-vite/src/components/auth/PasswordResetGuard.tsx`

```typescript
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';

interface PasswordResetGuardProps {
  children: React.ReactNode;
}

export class PasswordResetGuard extends Component<PasswordResetGuardProps> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  render() {
    const { requiresPasswordReset, isLoading } = this.context;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // If user requires password reset, redirect to change password page
    if (requiresPasswordReset) {
      return <Navigate to="/change-password" replace />;
    }

    // Otherwise, render the protected content
    return <>{this.props.children}</>;
  }
}
```

**Usage:** Wrap protected routes that should enforce password reset:
```typescript
<Route 
  path="/admin/dashboard" 
  element={
    <PasswordResetGuard>
      <AdminDashboard />
    </PasswordResetGuard>
  } 
/>
```

**Reasoning:**
- Prevents access to protected pages until password is reset
- Centralized guard component for consistency
- Can be applied selectively to routes

---

## Testing Plan

### Backend Testing

1. **Test Database Seeder**
   - Run the application and verify seeded users have correct `requiresPasswordReset` flag
   - Admin: `requiresPasswordReset = true`
   - Employer: `requiresPasswordReset = true`
   - Students: `requiresPasswordReset = false`

2. **Test Login Response**
   - Login as admin → verify JWT response includes `requiresPasswordReset: true`
   - Login as employer → verify JWT response includes `requiresPasswordReset: true`
   - Login as student → verify JWT response includes `requiresPasswordReset: false`

3. **Test Password Change Endpoint**
   - Test with correct current password → should succeed
   - Test with incorrect current password → should fail with 400
   - Test with matching new/old password → should fail with validation error
   - Test with non-matching confirmation → should fail with validation error
   - Verify `requiresPasswordReset` flag is cleared after successful change

### Frontend Testing

1. **Test Login Flow**
   - Login as admin → should redirect to `/change-password`
   - Login as employer → should redirect to `/change-password`
   - Login as student → should redirect normally

2. **Test Password Change Page**
   - Verify all validations work (password strength, matching, etc.)
   - Test successful password change
   - Verify redirect after successful change
   - Test error handling

3. **Test Route Protection**
   - Try accessing admin dashboard before password reset → should redirect
   - Change password → should be able to access dashboard
   - Verify onboarding flow still works after password reset

---

## Migration Steps

### Step 1: Database Migration
Since you're adding a new field to the User entity, you'll need to handle the migration:

**Option A: Drop and Recreate (Development Only)**
```sql
DROP TABLE IF EXISTS users CASCADE;
-- Let Spring JPA recreate tables with the new field
```

**Option B: Add Column (Production)**
```sql
ALTER TABLE users 
ADD COLUMN requires_password_reset BOOLEAN DEFAULT FALSE;

-- Set flag for existing admin and employer users
UPDATE users 
SET requires_password_reset = TRUE 
WHERE email IN ('admin@ojtech.com', 'employer@ojtech.com');
```

### Step 2: Backend Deployment
1. Update User entity
2. Update JwtResponse
3. Update DatabaseSeeder
4. Update AuthController
5. Create ChangePasswordRequest DTO
6. Add change-password endpoint
7. Test backend

### Step 3: Frontend Deployment
1. Update authService types
2. Update AuthProvider
3. Create ChangePasswordPage
4. Update LoginPage redirect logic
5. Add route in App.tsx
6. Test frontend

---

## Security Considerations

1. **Password Validation**
   - Minimum 6 characters (can be increased)
   - Should not match old password
   - Strength indicator helps users choose secure passwords

2. **Authentication Required**
   - Change password endpoint requires authentication
   - Current password verification prevents unauthorized changes

3. **Session Handling**
   - User remains logged in after password change
   - JWT token remains valid
   - No forced re-login required

4. **OAuth Users**
   - OAuth users (Google, GitHub) don't need password reset
   - Field defaults to `false` for OAuth registrations
   - Current password check is skipped for OAuth users

---

## Future Enhancements

1. **Password History**
   - Store hash of last N passwords
   - Prevent reuse of recent passwords

2. **Password Expiry**
   - Add `passwordExpiresAt` field
   - Force periodic password changes

3. **Email Notification**
   - Send email when password is changed
   - Alert users of suspicious activity

4. **Multi-Factor Authentication**
   - Add MFA requirement for admin/employer
   - Enhance security for privileged accounts

5. **Password Complexity Rules**
   - Configurable password policies
   - Different requirements per role

---

## Summary

This implementation provides a secure, user-friendly way to enforce password resets for admin and employer users on first login. The solution:

✅ **Backend:** Adds database tracking, updates authentication flow, and provides a secure password change endpoint

✅ **Frontend:** Creates a dedicated password change page with validation and UX enhancements

✅ **Security:** Validates current password, ensures uniqueness, and provides strength feedback

✅ **Integration:** Works seamlessly with existing onboarding and role-based routing

✅ **Scalable:** Easy to extend with additional security features

The implementation follows best practices for security and user experience while maintaining compatibility with the existing codebase structure.

