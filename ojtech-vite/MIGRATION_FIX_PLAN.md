# Fix Plan for OJTech Migration Issues

## Common Issues Found

1. **Duplicate import statements** - Many files have syntax issues with duplicate `import {` statements
2. **Next.js specific imports** - Components still using `next/link`, `next/router`, etc. instead of React Router equivalents
3. **Path aliases** - Many files use `@/` path aliases that need to be replaced with relative paths
4. **Component import case sensitivity** - Some components have incorrect casing in import statements
5. **Missing exported components** - Some files are not exporting components correctly (default vs named exports)
6. **React hooks in class components** - Form components using React Hook Form need to be refactored to use class state

## Recently Fixed Issues

1. **Form Components** - Added missing Form components:
   - Added `FormControl`, `FormDescription`, and `FormItem` to the Form.tsx file
   - Fixed component exports to use named exports consistently

2. **Class Component Conversion** - Converted functional components with hooks to class components:
   - CompanyInfoForm.tsx - Replaced React Hook Form with class state management
   - ContactDetailsForm.tsx - Converted to use named export and class state management
   - LogoUpload.tsx - Added file upload functionality using class components
   - ReviewForm.tsx - Fixed the review form to work with class components
   - OnboardingCheckLayout.tsx - Replaced React Router hooks with class-based routing
   - EmployerJobCard.tsx - Implemented fully-featured job card with proper component structure
   - Table.tsx - Converted to use named exports for all table components
   - Spinner.tsx - Fixed export to use named export

## Automated Fixes

We've created and run a script (`scripts/fix-imports.js`) that:
- Fixed path aliases in 67 files
- Replaced Next.js Link components with React Router equivalents
- Updated import paths to use relative paths

## Manual Fixes Required

### Fixing Duplicate Import Statements

Many files still have duplicate import statements like this example:

```typescript
import {
import { Home, Building } from "lucide-react";
```

To fix:
1. Identify the intended imports
2. Combine them into a single import statement
3. Fix component references in the code

### Converting Hook-Based Forms to Class Components

For forms that use React Hook Form:

1. Replace form state hooks with class component state
2. Implement manual validation methods
3. Use controlled components with onChange handlers
4. Replace the useForm hook with direct form submission handlers

Example conversion pattern:
```typescript
// Before (functional component with hooks)
function MyForm() {
  const form = useForm({...});
  
  return (
    <FormField control={form.control} name="field" ... />
  );
}

// After (class component)
class MyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: { field: '' },
      errors: {},
      touched: {}
    };
  }
  
  handleChange = (name, value) => {
    this.setState(prev => ({
      formData: {...prev.formData, [name]: value}
    }));
  }
  
  render() {
    return (
      <FormField>
        <Input value={this.state.formData.field} 
               onChange={e => this.handleChange('field', e.target.value)} />
      </FormField>
    );
  }
}
```

### Checking Browser Issues

The app is now running at http://localhost:5174, but you may see errors in the browser console that need fixing:

1. Open the browser and navigate to http://localhost:5174
2. Open the browser's developer tools (F12)
3. Look for errors in the Console tab
4. Fix the specific component issues one by one

### Component Case Sensitivity

Ensure all component imports match the actual file names. Common issues:
- `Button.tsx` but imported as `button.tsx`
- `Card.tsx` but imported as `card.tsx`

## Next Steps

1. Fix any remaining duplicate import statements
2. Check browser console for any runtime errors
3. Convert any remaining functional components with hooks to class components
4. Replace any remaining Next.js specific components
5. Fix any remaining TypeScript errors
6. Test component functionality

## Testing Plan

After fixing the issues:
1. Test the login/registration flow
2. Test job listing and details pages
3. Test the employer onboarding process
4. Test form submissions
5. Verify all UI components render correctly

## List of Files with Remaining Issues

The most critical files that need fixing are:

1. `src/components/jobs/JobList.tsx` - Duplicate imports
2. `src/components/employer/EmployerBreadcrumb.tsx` - Already fixed but might need additional checks
3. `src/components/ui/FileDropInput.tsx` - Path issues fixed but might have other issues
4. `src/components/ui/Form.tsx` - Completely rewritten, needs verification
5. `src/components/ui/ApplicationCard.tsx` - Completely rewritten, needs verification

Run the app and check each component's functionality after fixing these files.
