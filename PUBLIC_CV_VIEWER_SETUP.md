# Public CV Viewer Setup

## Overview
The public CV viewer allows employers to view student CVs directly from email links without requiring authentication. The CV is rendered beautifully on the frontend with modern styling.

## How It Works

### 1. Backend API Endpoints

#### `/api/cvs/{id}/view` (GET)
- **Purpose**: Redirects to the frontend CV viewer page
- **Access**: Public (no authentication required)
- **Behavior**: Returns a 302 redirect to `{FRONTEND_URL}/cv/{id}`
- **Used in**: Email links sent to employers

#### `/api/cvs/{id}/data` (GET)
- **Purpose**: Returns CV data as JSON
- **Access**: Public (no authentication required)
- **Returns**: Parsed resume JSON with all CV sections
- **Used by**: Frontend CV viewer page

### 2. Frontend CV Viewer Page

**Route**: `/cv/:cvId`

**Location**: `ojtech-vite/src/pages/PublicCVViewerPage.tsx`

**Features**:
- Modern, responsive design with gradient backgrounds
- Dark header with the candidate's name
- Two-column layout (35% sidebar, 65% main content)
- Sections:
  - Contact information (email, phone, GitHub - all clickable)
  - Skills (grouped by category with colored cards)
  - Education
  - Certifications
  - Professional Summary
  - Experience (with achievements)
  - Projects (with highlights)
- Loading state with spinner
- Error handling for missing CVs
- Mobile responsive (stacks columns on small screens)

### 3. Security Configuration

The following endpoints are configured in `SecurityConfig.java` to allow public access:
```java
.requestMatchers("/api/cvs/*/view").permitAll()
.requestMatchers("/api/cvs/*/data").permitAll()
```

## Flow Diagram

```
Email Link Click
      ↓
[Backend] GET /api/cvs/{id}/view
      ↓
302 Redirect to Frontend
      ↓
[Frontend] /cv/{cvId}
      ↓
Fetch CV Data
      ↓
[Backend] GET /api/cvs/{id}/data
      ↓
Return JSON
      ↓
[Frontend] Renders Beautiful CV
```

## Environment Variables

### Backend (`application.properties`)
```properties
# Frontend URL for redirects (defaults to http://localhost:5173 if not set)
# Set this in production to your actual frontend URL
# FRONTEND_URL=https://yourdomain.com
```

### Frontend (`.env`)
```env
# API URL (defaults to http://localhost:8081 if not set)
VITE_API_URL=http://localhost:8081
```

## Email Integration

The CV link in job application emails looks like:
```
https://your-backend-url.com/api/cvs/{cv-id}/view
```

When an employer clicks this link:
1. Backend redirects to: `https://your-frontend-url.com/cv/{cv-id}`
2. Frontend loads the public CV viewer page
3. Frontend fetches JSON data from: `/api/cvs/{cv-id}/data`
4. Frontend renders the CV with beautiful styling

## Testing Locally

### 1. Start Backend
```bash
cd JavaSpringBootOAuth2JwtCrud
./mvnw spring-boot:run
```

### 2. Start Frontend
```bash
cd ojtech-vite
npm run dev
```

### 3. Test URLs
- Backend redirect: `http://localhost:8081/api/cvs/{cv-id}/view`
- Direct frontend: `http://localhost:5173/cv/{cv-id}`
- JSON data: `http://localhost:8081/api/cvs/{cv-id}/data`

## Styling Features

The CV viewer includes:
- ✨ Gradient backgrounds (blue/indigo/purple blend)
- 📱 Fully responsive design
- 🎨 Modern card-based layout with shadows
- 🔵 Blue accent color (#3B82F6) for highlights
- ↗️ Hover effects on links
- 📧 Clickable contact information (email, phone, GitHub)
- 🏷️ Skill tags with category grouping
- 📋 Card-style experience and project sections
- 🖨️ Print-friendly (if needed)

## Deployment Notes

### Production Setup

1. **Set Frontend URL in Backend**:
   Add to your production environment or `application-prod.properties`:
   ```properties
   # Or set as environment variable
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Set API URL in Frontend**:
   Add to production `.env.production`:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

3. **CORS Configuration**:
   Ensure your CORS config in `SecurityConfig.java` includes your frontend URL

4. **Email Templates**:
   The CV links in emails are generated in:
   - `JobApplicationController.java` (line 567)
   - Uses `baseUrl + "/api/cvs/" + cv.getId() + "/view"`

## Benefits of This Approach

1. **Better UX**: Modern, responsive frontend design
2. **Easier Maintenance**: Frontend styling is easier to update than embedded HTML
3. **Performance**: JSON is smaller than full HTML
4. **Flexibility**: Can easily add features (print button, share, etc.)
5. **Consistent Branding**: Matches the rest of your application
6. **Mobile-Friendly**: Responsive design works on all devices
7. **SEO-Ready**: Can add meta tags for sharing

## Future Enhancements

Potential features to add:
- [ ] Print button with optimized print stylesheet
- [ ] Share button (copy link)
- [ ] Download as PDF
- [ ] Theme toggle (light/dark mode)
- [ ] Language toggle if multi-language CVs
- [ ] View count tracking
- [ ] Employer feedback form

## Troubleshooting

### CV Not Loading
- Check if CV ID is valid
- Verify CV is marked as `active=true` in database
- Check browser console for API errors
- Verify CORS settings allow frontend origin

### Redirect Not Working
- Check `FRONTEND_URL` environment variable
- Verify redirect URL in browser network tab
- Check SecurityConfig permits the endpoint

### Styling Issues
- Clear browser cache
- Check if Tailwind CSS is loaded
- Verify all Lucide icons are imported
- Check console for CSS errors




