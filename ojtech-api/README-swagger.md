# Swagger Integration for OJTech API

## Overview

This project includes Swagger/OpenAPI integration for API documentation and testing. The Swagger UI provides an interactive way to explore and test API endpoints directly from your browser.

## Features Added

1. **OpenAPI 3.0 Documentation**: Full API documentation with detailed descriptions of endpoints, request parameters, and response objects.
2. **Interactive Swagger UI**: Test API calls directly from the browser with a user-friendly interface.
3. **JWT Authentication Support**: Authentication mechanisms are documented and can be used within the Swagger UI.
4. **Organized by Tags**: API endpoints are organized by functional areas for easier navigation.

## Accessing Swagger UI

When the application is running, you can access the Swagger UI at:

```
http://localhost:8080/swagger-ui.html
```

The raw OpenAPI specification is available in JSON format at:

```
http://localhost:8080/api-docs
```

## Usage Tips

1. **Authentication**: To test endpoints that require authentication, use the "Authorize" button in the Swagger UI and provide your JWT token.
2. **Try it Out**: Each endpoint has a "Try it out" button that allows you to make actual API calls.
3. **Filtering**: Use the filter box at the top to quickly find specific endpoints.

## Technical Implementation

- **SpringDoc OpenAPI**: Using springdoc-openapi library (version 2.8.8)
- **Swagger Annotations**: Controllers are annotated with @Tag, @Operation, @Parameter, etc.
- **Security Configuration**: Security settings updated to allow access to Swagger UI paths.
- **Custom Configuration**: Configuration class with @OpenAPIDefinition for API metadata.

## Customization

The Swagger UI and OpenAPI behavior can be customized through application.properties:

```properties
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha
springdoc.swagger-ui.tryItOutEnabled=true
``` 