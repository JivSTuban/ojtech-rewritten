# OJTech Active Context

## Current Focus

The current focus is on completing the migration from Next.js to React Vite while ensuring all functionality works correctly. This involves:

1. **Frontend Migration**: Converting remaining Next.js components to React Vite class components
2. **API Integration**: Ensuring proper integration between the React frontend and Spring Boot backend
3. **Authentication Flow**: Fixing issues in the authentication and registration process
4. **Form Components**: Converting hook-based forms to class-based implementations

## Recent Changes

### Frontend
1. **Authentication Flow Improvements**:
   - Removed unnecessary email verification step
   - Implemented automatic login after registration
   - Fixed issues with username/email handling
   - Improved error handling and user feedback
   - Updated the AuthProvider to use generated username for login
   - Added graceful fallback to manual login if automatic login fails
   - Implemented profile creation with full name after successful login

2. **Component Migrations**:
   - Converted form components to class components
   - Fixed import statement issues
   - Replaced Next.js specific code with React Router equivalents
   - Updated path aliases to use relative paths
   - Added missing Form components (FormControl, FormDescription, FormItem)
   - Fixed component exports to use named exports consistently

3. **UI Consistency**:
   - Improved visual consistency across the application
   - Updated AuthLayout to match main Navbar styling
   - Ensured consistent button styling
   - Added proper spacing and alignment in auth pages

### Backend
The Spring Boot backend is relatively stable with the following recent updates:

1. **API Documentation**: Added Swagger/OpenAPI documentation
2. **Security Configuration**: Enhanced JWT authentication
3. **Entity Relationships**: Refined relationships between core entities

## Known Issues

1. **Duplicate Import Statements**: Many files have syntax issues with duplicate import statements
2. **Next.js Specific Imports**: Some components still using Next.js imports
3. **Path Alias Resolution**: Issues with `@/` path aliases
4. **Component Case Sensitivity**: Inconsistent casing in component imports
5. **Hook Usage in Class Components**: Some class components still attempting to use React hooks
6. **Registration Flow**: Issues with the backend's `SignupRequest` class not accepting the `fullName` field
7. **Authentication Errors**: Errors during the login process after registration

## Next Steps

1. **Fix Duplicate Import Statements**: Resolve syntax issues in files like `src/components/jobs/JobList.tsx`
2. **Complete Form Component Migration**: Finish converting hook-based forms to class components
3. **Verify Fixed Components**: Test components that have been rewritten like `Form.tsx` and `ApplicationCard.tsx`
4. **Test Authentication Flow**: Thoroughly test the registration and login process
5. **Remove Supabase References**: Replace remaining Supabase code with direct API calls
6. **Check Browser Issues**: Identify and fix errors in the browser console
7. **Optimize Performance**: Identify and address performance bottlenecks

## Active Decisions

1. **Class Component Architecture**: Continue using class components for consistency, despite the industry trend toward functional components with hooks
2. **API Integration Strategy**: Direct API calls using Axios instead of using Supabase as an intermediary
3. **Form State Management**: Manual form state management in class components instead of React Hook Form
4. **Authentication Storage**: Store JWT tokens in localStorage for persistence
5. **Error Handling Approach**: Centralized error handling through the Toast provider
6. **Username Generation**: Auto-generate username from email to satisfy backend requirements
7. **Profile Data Handling**: Store fullName in session storage during registration and create profile after login

## Current Work Areas

### High Priority
1. **Authentication Flow**: Fixing registration and login issues
2. **Import Statement Fixes**: Resolving syntax errors in import statements
3. **Form Components**: Completing the conversion of forms to class components

### Medium Priority
1. **UI Consistency**: Ensuring consistent styling across the application
2. **Error Handling**: Improving error messages and handling
3. **Documentation**: Updating documentation to reflect recent changes

### Low Priority
1. **Performance Optimization**: Identifying and addressing performance bottlenecks
2. **Code Cleanup**: Removing unused code and comments
3. **Test Coverage**: Adding unit and integration tests 