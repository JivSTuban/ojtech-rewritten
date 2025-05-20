# OJTech - React Vite Frontend

This is the React Vite frontend for the OJTech job matching application. It's a migration from the original Next.js application to React Vite, using class components and integrating with the Spring Boot API.

## Technology Stack

- **React**: Frontend library
- **Vite**: Build tool and development server
- **TypeScript**: Type safety for JavaScript
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **Spring Boot API**: Backend RESTful API

## Key Features

- User authentication and authorization
- Job opportunity discovery and application
- Resume upload and parsing
- Profile management for students and employers
- Job posting management for employers

## Architecture

The application follows a class component architecture, making use of React's context API for state management. Key patterns:

- **Class Components**: Most components are implemented as ES6 classes extending React.Component
- **Context API**: Used for global state like auth context
- **HOC Pattern**: Used for protected routes and authentication wrappers
- **API Service Layer**: Clean separation of API calls in dedicated service modules

## Pages Migrated from Next.js

The following pages have been migrated from the Next.js application:

1. **HomePage**: Landing page with feature overview
2. **OpportunitiesPage**: Job opportunities with swipe interface
3. **JobDetailPage**: Detailed job information
4. **JobApplicationPage**: Application form for jobs
5. **ProfilePage**: User profile management

## Spring Boot API Integration

The application integrates with a Spring Boot backend API. Key integration points:

- **Authentication**: JWT-based authentication
- **Job Matching**: AI-powered job matching algorithms
- **Profile Management**: Student and employer profile handling
- **Resume Parsing**: CV upload and parsing capabilities
- **Application Tracking**: Job application status tracking

## Fixing Circular Reference in Spring Boot Backend

The application may face circular reference issues when serializing entities to JSON. This results in errors like "Maximum depth exceeded" or "JSON serialization failed" when retrieving profiles or other data with bidirectional relationships.

### Solution Options:

1. **Add @JsonIgnore annotation** to one side of bidirectional relationships:
   ```java
   public class Profile {
       // ...
       @OneToOne
       @JoinColumn(name = "user_id")
       private User user;
       // ...
   }

   public class User {
       // ...
       @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
       @JsonIgnore // Add this to prevent circular references
       private Profile profile;
       // ...
   }
   ```

2. **Configure Jackson with managed references**:
   ```java
   public class Profile {
       // ...
       @OneToOne
       @JoinColumn(name = "user_id")
       @JsonManagedReference
       private User user;
       // ...
   }

   public class User {
       // ...
       @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
       @JsonBackReference
       private Profile profile;
       // ...
   }
   ```

3. **Use DTOs instead of returning entity objects directly**:
   - Create Data Transfer Objects (DTOs) that contain only the needed fields
   - Map entity objects to DTOs before returning from controllers
   - This provides a clean separation and avoids circular references

4. **Add a JacksonConfig class** to your backend:
   ```java
   @Configuration
   public class JacksonConfig {
       @Bean
       public ObjectMapper objectMapper() {
           ObjectMapper mapper = new ObjectMapper();
           mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
           
           // Handle circular references
           mapper.configure(SerializationFeature.FAIL_ON_SELF_REFERENCES, false);
           mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
           
           // Configure for Hibernate
           mapper.registerModule(new JavaTimeModule());
           mapper.registerModule(new Hibernate5JakartaModule());
           
           return mapper;
       }
   }
   ```

These solutions address circular references in bidirectional relationships while ensuring proper data serialization.

## Development

To run the application in development mode:

```bash
npm install
npm run dev
```

## Build

To build the application for production:

```bash
npm run build
```

## Future Improvements

- Add real-time notifications
- Implement complete test coverage
- Add CI/CD pipeline
- Enhance mobile responsiveness
- Implement offline capabilities

## Migration Notes

This application was migrated from Next.js to React Vite with the following changes:

1. Converted functional components to class components
2. Changed from Next.js API routes to Spring Boot API endpoints
3. Replaced Next.js routing with React Router
4. Replaced server-side rendering with client-side rendering
5. Replaced Supabase integration with direct Spring Boot API integration

## License

MIT
