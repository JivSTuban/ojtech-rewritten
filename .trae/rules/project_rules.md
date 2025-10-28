Note dont include frontend components

# Automated Backend PlantUML Diagram Generation Rules

## Purpose

Automatically generate **Class Diagrams**, **Sequence Diagrams**, **Entity Relationship Diagrams (ERD)**, and **Use Case Diagrams** for backend modules/transactions based on use case descriptions.

***

## Trigger

Activated when user provides:

- Module/Transaction name
- Use case description, including actors, preconditions, postconditions, and flows

***

## Process

### Step 1: Analyze Use Case Input

Extract:

- Module/Transaction name
- Actors (system or human)
- Preconditions and postconditions
- Main and alternate flows
- Data entities and logic

***

### Step 2: Scan Backend Files

Scan these actual backend files for the given module/transaction:
Note: dont miss a single file except if its not available.
- `src/main/java/**/controller/*{ModuleName}*Controller.java`
- `src/main/java/**/service/*{ModuleName}*Service.java`
- `src/main/java/**/service/impl/*{ModuleName}*ServiceImpl.java`
- `src/main/java/**/repositories/*{ModuleName}*Repository.java`
- `src/main/java/**/entities/*{ModuleName}*.java` or `**/model/*{ModuleName}*.java`
- `src/main/java/**/dtos/*{ModuleName}*DTO.java`, `*{ModuleName}*Request.java`, `*{ModuleName}*Response.java`
- `src/main/java/**/exceptions/*{ModuleName}*Exception.java`
- `src/main/resources/application.properties` or `application.yml` (if relevant)

> **Frontend files are NOT included in any step.**

***

### Step 3: Generate Class Diagram

- Show:
    - Controllers and their REST endpoints/methods
    - Service interfaces and implementations
    - Repository interfaces
    - Entities/models with attributes and relationships
    - DTOs, exceptions, configuration classes (if present)
    - Relationships: dependencies, inheritance, composition
    - Annotation/comments for complex logic or validation

**PlantUML Format:**

```plantuml
@startuml
' Class Diagram: Backend Architecture

@enduml
```


***

### Step 4: Generate Sequence Diagram

- Show backend flow per use case only:
    - Actor
    - Controller
    - Service layer
    - Repository/database operations
    - Exception handling / validation
    - Data response

**Frontend components are NOT included.**

**PlantUML Format:**

```plantuml
@startuml
' Sequence Diagram: Use Case Flow

@enduml
```


***

### Step 5: Generate Entity Relationship Diagram (ERD)

- Show:
    - Entities/tables, primary/foreign keys, and data types
    - Relationships, cardinality and constraints
    - Audit fields (`created_at`, `updated_at`, `created_by`)

**PlantUML Format:**

```plantuml
@startuml
' ERD: Database Schema

@enduml
```


***

### Step 6: Generate Use Case Diagram

- Actors
- Use cases (features/tasks)

```
- Associations, <<include>>, <<extend>> relationships  
```

- System boundaries as backend modules only

**PlantUML Format:**

```plantuml
@startuml
' Use Case Diagram

@enduml
```


***

### Step 7: List Backend Component(s) Only

Present details for each backend component (this time include frontend):

#### Format

- **Component Name:**
**Description and Purpose:**
**Component Type or Format:**

**Example:**

- **Component Name:** StudentProfileController
**Description and Purpose:** Handles REST requests for student profiles.
**Component Type or Format:** Spring Boot REST controller class.

***

## Quality Requirements

- ✅ Scan ONLY backend files for actual class, method, and entity names.
- ✅ Use correct PlantUML syntax, and real codebase details.
- ✅ Diagrams must include notes for significant validation/business logic.
- ✅ Accurately show error handling and validation steps.
- ✅ Do NOT include any frontend components.
- ✅ List backend components with name, description, and implementation format.

***


