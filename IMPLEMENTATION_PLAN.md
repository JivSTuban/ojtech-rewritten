# OJTech Enhancement Implementation Plan

## Overview
This document provides a comprehensive implementation plan for enhancing the OJTech platform with the following features:
1. Multiple match scores (Personality, Skills, Experience) with averaged final score
2. Swipe-to-Gmail functionality with automatic CV, cover letter, and recipient attachment
3. Dynamic CV input with checkboxes for student preferences
4. Multiple CV template support
5. Expanded skills/hobbies categorization (Skills vs Specialties)
6. Low match score notification (below 40%)

## Feature 1: Multiple Match Scores System

### Backend Changes

#### 1.1 New Entity: `MatchScoreComponents.java`
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/MatchScoreComponents.java`
**Status**: NEW FILE
```java
@Entity
@Table(name = "match_score_components")
public class MatchScoreComponents {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "job_match_id")
    private JobMatch jobMatch;
    
    @Column(name = "personality_score")
    private Double personalityScore;
    
    @Column(name = "skills_score")
    private Double skillsScore;
    
    @Column(name = "experience_score")
    private Double experienceScore;
    
    @Column(name = "overall_score")
    private Double overallScore;
    
    @Column(name = "score_explanation", columnDefinition = "TEXT")
    private String scoreExplanation;
    
    // Getters, setters, constructors
}
```

#### 1.2 Update JobMatch Entity
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/JobMatch.java`
**Status**: MODIFY
```java
// Add to existing entity:
@OneToOne(mappedBy = "jobMatch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private MatchScoreComponents scoreComponents;
```

#### 1.3 Update JobMatchService
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/services/JobMatchService.java`
**Status**: MODIFY
- Add method `calculateMultiFactorMatchScore()`
- Update existing `calculateMatchScoreWithAllData()` to use multi-factor scoring
- Add personality assessment logic
- Add experience scoring logic

#### 1.4 New Repository
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/repositories/MatchScoreComponentsRepository.java`
**Status**: NEW FILE

#### 1.5 Update DTOs
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/dtos/responses/JobMatchResponseDTO.java`
**Status**: MODIFY
- Add fields for personality, skills, and experience scores
- Add score explanation field

### Frontend Changes

#### 1.6 Update Match Display Components
**Files to Modify**:
- `ojtech-vite/src/components/jobs/JobCard.tsx`
- `ojtech-vite/src/components/jobs/JobMatches.tsx`
- `ojtech-vite/src/pages/OpportunitiesPage.tsx`

**Changes**:
- Display multiple score bars instead of single score
- Add score breakdown modal/tooltip
- Update TypeScript interfaces

#### 1.7 New Components
**File**: `ojtech-vite/src/components/jobs/MatchScoreBreakdown.tsx`
**Status**: NEW FILE
- Component to display detailed score breakdown
- Visual progress bars for each score component
- Explanation text for each score

#### 1.8 Update Types
**File**: `ojtech-vite/src/lib/types/index.ts`
**Status**: MODIFY
```typescript
interface MatchScoreComponents {
  personalityScore: number;
  skillsScore: number;
  experienceScore: number;
  overallScore: number;
  scoreExplanation: string;
}

interface JobWithMatchScore {
  // existing fields...
  scoreComponents?: MatchScoreComponents;
}
```

## Feature 2: Swipe-to-Gmail Functionality

### Backend Changes

#### 2.1 New Service: EmailRedirectService
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/services/EmailRedirectService.java`
**Status**: NEW FILE
```java
@Service
public class EmailRedirectService {
    
    @Autowired
    private CoverLetterService coverLetterService;
    
    @Autowired
    private CVService cvService;
    
    public EmailRedirectData generateEmailRedirectData(UUID studentId, UUID jobId) {
        // Generate cover letter
        // Get CV as attachment
        // Format email subject and body
        // Return Gmail URL with pre-filled data
    }
    
    public String generateGmailUrl(String recipientEmail, String subject, String body, String attachmentUrl) {
        // Create Gmail compose URL with pre-filled data
    }
}
```

#### 2.2 New Controller Endpoint
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/controller/EmailRedirectController.java`
**Status**: NEW FILE
```java
@RestController
@RequestMapping("/api/email")
public class EmailRedirectController {
    
    @PostMapping("/generate-redirect/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> generateEmailRedirect(@PathVariable UUID jobId) {
        // Generate email redirect data
        // Return Gmail URL and attachment data
    }
}
```

#### 2.3 Update JobApplication Flow
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/controller/JobApplicationController.java`
**Status**: MODIFY
- Add email redirect option to application flow
- Store email redirect history

### Frontend Changes

#### 2.4 Update Swipe Component
**File**: `ojtech-vite/src/pages/OpportunitiesPage.tsx`
**Status**: MODIFY
```typescript
// Add to existing swipe handlers:
handleSwipeRight = async (jobId: string) => {
  try {
    // Check match score first
    const job = this.findJobById(jobId);
    if (job.matchScore < 40) {
      // Show warning modal
      this.showLowMatchScoreWarning(job);
      return;
    }
    
    // Generate email redirect
    const emailData = await this.generateEmailRedirect(jobId);
    
    // Open Gmail with pre-filled data
    window.open(emailData.gmailUrl, '_blank');
    
    // Mark as applied
    await this.applyForJob(jobId);
  } catch (error) {
    // Handle error
  }
};
```

#### 2.5 New Service
**File**: `ojtech-vite/src/lib/api/emailRedirectService.ts`
**Status**: NEW FILE
```typescript
export const emailRedirectService = {
  generateEmailRedirect: async (jobId: string): Promise<EmailRedirectData> => {
    // API call to generate email redirect data
  },
  
  openGmailCompose: (emailData: EmailRedirectData) => {
    // Open Gmail with pre-filled data
  }
};
```

#### 2.6 Update Types
**File**: `ojtech-vite/src/lib/types/index.ts`
**Status**: MODIFY
```typescript
interface EmailRedirectData {
  gmailUrl: string;
  recipientEmail: string;
  subject: string;
  body: string;
  attachmentUrls: string[];
}
```

## Feature 3: Dynamic CV Input with Checkboxes

### Backend Changes

#### 3.1 Update CV Entity
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/CV.java`
**Status**: MODIFY
```java
// Add new fields:
@Column(name = "student_preferences", columnDefinition = "TEXT")
private String studentPreferences; // JSON string for preferences

@Column(name = "dynamic_sections", columnDefinition = "TEXT") 
private String dynamicSections; // JSON string for enabled sections

@Column(name = "cv_template_id")
private String cvTemplateId;
```

#### 3.2 New Entity: CVTemplate
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/CVTemplate.java`
**Status**: NEW FILE
```java
@Entity
@Table(name = "cv_templates")
public class CVTemplate {
    @Id
    private String id; // e.g., "modern", "classic", "creative"
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "template_html", columnDefinition = "TEXT")
    private String templateHtml;
    
    @Column(name = "template_css", columnDefinition = "TEXT")
    private String templateCss;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    // Getters, setters
}
```

#### 3.3 Update CV Generation Service
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/services/CVGenerationService.java`
**Status**: NEW FILE
```java
@Service
public class CVGenerationService {
    
    public String generateDynamicCV(UUID cvId, String templateId, Map<String, Boolean> sectionPreferences) {
        // Load CV data
        // Apply template
        // Filter sections based on preferences
        // Generate HTML
    }
    
    public List<CVTemplate> getAvailableTemplates() {
        // Return available templates
    }
}
```

### Frontend Changes

#### 3.4 New CV Builder Component
**File**: `ojtech-vite/src/components/resume/CVBuilder.tsx`
**Status**: NEW FILE
```typescript
interface CVBuilderProps {
  cvId?: string;
  onSave: (cvData: CVData) => void;
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ cvId, onSave }) => {
  // Dynamic form with checkbox preferences
  // Template selection
  // Real-time preview
  // Section enable/disable toggles
};
```

#### 3.5 Update Resume Management Page
**File**: `ojtech-vite/src/pages/ResumeManagementPage.tsx`
**Status**: MODIFY
- Add template selection
- Add section preference checkboxes
- Add dynamic preview

#### 3.6 New Template Selector Component
**File**: `ojtech-vite/src/components/resume/TemplateSelector.tsx`
**Status**: NEW FILE
- Visual template previews
- Template switching with live preview

## Feature 4: Multiple CV Templates Support

### Backend Changes

#### 4.1 Template Repository
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/repositories/CVTemplateRepository.java`
**Status**: NEW FILE

#### 4.2 Template Controller
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/controller/CVTemplateController.java`
**Status**: NEW FILE
```java
@RestController
@RequestMapping("/api/cv-templates")
public class CVTemplateController {
    
    @GetMapping
    public ResponseEntity<List<CVTemplate>> getAvailableTemplates() {
        // Return available templates
    }
    
    @GetMapping("/{templateId}/preview")
    public ResponseEntity<String> getTemplatePreview(@PathVariable String templateId) {
        // Return template HTML preview
    }
}
```

#### 4.3 Database Migration
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/resources/db/migration/V4__add_cv_templates.sql`
**Status**: NEW FILE
```sql
CREATE TABLE cv_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_html TEXT NOT NULL,
    template_css TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default templates
INSERT INTO cv_templates (id, name, description, template_html, template_css) VALUES
('modern', 'Modern Template', 'Clean and modern design', '...', '...'),
('classic', 'Classic Template', 'Traditional professional layout', '...', '...'),
('creative', 'Creative Template', 'Colorful and creative design', '...', '...');
```

### Frontend Changes

#### 4.4 Template Assets
**Directory**: `ojtech-vite/src/assets/cv-templates/`
**Status**: NEW DIRECTORY
- `modern.html`
- `classic.html`
- `creative.html`
- `modern.css`
- `classic.css`
- `creative.css`

#### 4.5 Update CV Generation Service
**File**: `ojtech-vite/src/lib/api/cvGeneratorService.ts`
**Status**: MODIFY
```typescript
export const cvGeneratorService = {
  getAvailableTemplates: async (): Promise<CVTemplate[]> => {
    // Fetch available templates
  },
  
  generateCVWithTemplate: async (cvData: CVData, templateId: string): Promise<string> => {
    // Generate CV HTML with specific template
  },
  
  previewTemplate: async (templateId: string, sampleData: Partial<CVData>): Promise<string> => {
    // Generate preview with sample data
  }
};
```

## Feature 5: Expanded Skills/Hobbies System

### Backend Changes

#### 5.1 New Entities
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/Skill.java`
**Status**: NEW FILE
```java
@Entity
@Table(name = "skills")
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private SkillCategory category; // TECHNICAL, SOFT, LANGUAGE, SPECIALTY
    
    @Column(name = "subcategory")
    private String subcategory; // e.g., "Programming Languages", "Frameworks"
    
    // Getters, setters
}
```

**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/StudentSkill.java`
**Status**: NEW FILE
```java
@Entity
@Table(name = "student_skills")
public class StudentSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile student;
    
    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;
    
    @Column(name = "proficiency_level")
    @Enumerated(EnumType.STRING)
    private ProficiencyLevel proficiencyLevel; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;
    
    @Column(name = "is_specialty")
    private Boolean isSpecialty;
    
    // Getters, setters
}
```

#### 5.2 Update StudentProfile Entity
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/entities/StudentProfile.java`
**Status**: MODIFY
```java
// Add new relationships:
@OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
private Set<StudentSkill> studentSkills = new HashSet<>();

@Column(name = "hobbies", columnDefinition = "TEXT")
private String hobbies; // JSON array of hobbies

@Column(name = "interests", columnDefinition = "TEXT")
private String interests; // JSON array of interests

@Column(name = "personality_traits", columnDefinition = "TEXT")
private String personalityTraits; // JSON for personality assessment
```

#### 5.3 New Services
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/java/com/melardev/spring/jwtoauth/services/SkillsService.java`
**Status**: NEW FILE
```java
@Service
public class SkillsService {
    
    public List<Skill> getAllSkillsByCategory(SkillCategory category) {
        // Return skills by category
    }
    
    public void updateStudentSkills(UUID studentId, List<StudentSkillRequest> skills) {
        // Update student's skill portfolio
    }
    
    public void categorizeSkillsAsSpecialties(UUID studentId, List<UUID> skillIds) {
        // Mark specific skills as specialties
    }
}
```

### Frontend Changes

#### 5.4 New Skills Management Component
**File**: `ojtech-vite/src/components/profile/SkillsManager.tsx`
**Status**: NEW FILE
```typescript
interface SkillsManagerProps {
  studentId: string;
  skills: StudentSkill[];
  onSkillsUpdate: (skills: StudentSkill[]) => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = (props) => {
  // Categorized skill selection
  // Proficiency level sliders
  // Specialty designation checkboxes
  // Drag-and-drop organization
};
```

#### 5.5 Update Onboarding Flow
**File**: `ojtech-vite/src/components/onboarding/SkillsStep.tsx`
**Status**: MODIFY
- Add category-based skill selection
- Add specialty designation
- Add proficiency level assessment
- Add personality traits questionnaire

#### 5.6 New Components
**Files**: 
- `ojtech-vite/src/components/profile/HobbiesEditor.tsx` (NEW)
- `ojtech-vite/src/components/profile/PersonalityAssessment.tsx` (NEW)
- `ojtech-vite/src/components/profile/SkillCategorySelector.tsx` (NEW)

## Feature 6: Low Match Score Notification

### Frontend Changes

#### 6.1 New Warning Modal Component
**File**: `ojtech-vite/src/components/ui/MatchScoreWarning.tsx`
**Status**: NEW FILE
```typescript
interface MatchScoreWarningProps {
  isOpen: boolean;
  matchScore: number;
  jobTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MatchScoreWarning: React.FC<MatchScoreWarningProps> = (props) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-amber-600">
            Low Match Score Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your match score for {jobTitle} is {matchScore}%, which is below 40%. 
            Are you sure you want to apply for this position?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-amber-600">
            Apply Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

#### 6.2 Update Swipe Logic
**File**: `ojtech-vite/src/pages/OpportunitiesPage.tsx`
**Status**: MODIFY
```typescript
// Add to state:
interface OpportunitiesPageState {
  // existing fields...
  showMatchWarning: boolean;
  warningJob: Job | null;
}

// Add warning logic to swipe handler:
handleSwipeRight = async (jobId: string) => {
  const job = this.findJobById(jobId);
  
  if (job.matchScore < 40) {
    this.setState({
      showMatchWarning: true,
      warningJob: job
    });
    return;
  }
  
  // Continue with normal application flow
  this.proceedWithApplication(job);
};
```

#### 6.3 Update Job Application Flow
**File**: `ojtech-vite/src/pages/JobDetailPage.tsx`
**Status**: MODIFY
- Add match score check before application
- Show warning modal for low scores
- Allow override with confirmation

## Prompt Engineering Strategy

### 7.1 Gemini API Prompts for Multi-Factor Scoring

#### Personality Score Prompt
```
You are an AI personality assessor specializing in job fit analysis. Analyze the compatibility between a candidate's personality traits and job requirements.

PERSONALITY ASSESSMENT CRITERIA:
1. Communication Style: Evaluate based on cover letter tone, bio description, project descriptions
2. Leadership Indicators: Look for leadership roles, team projects, initiative-taking
3. Problem-Solving Approach: Analyze project complexity, technical challenges overcome
4. Work Style Preferences: Remote vs in-person, team vs individual work
5. Cultural Fit: Match personality traits with company culture indicators

STUDENT PERSONALITY DATA:
- Bio: {student.bio}
- Project Descriptions: {project_descriptions}
- Leadership Experience: {leadership_experience}
- Communication Style: {communication_indicators}

JOB PERSONALITY REQUIREMENTS:
- Required Soft Skills: {job.softSkills}
- Team Structure: {job.teamStructure}
- Work Environment: {job.workEnvironment}
- Company Culture: {job.companyCulture}

Provide a personality match score (1-100) and detailed explanation focusing on:
- Communication compatibility
- Leadership alignment
- Problem-solving fit
- Cultural match

Return only the numeric score followed by a brief explanation.
```

#### Experience Score Prompt
```
You are an AI experience evaluator specializing in career progression analysis. Assess how well a candidate's experience aligns with job requirements.

EXPERIENCE EVALUATION CRITERIA:
1. Relevant Work Experience: Direct industry/role experience
2. Project Complexity: Scale and complexity of past projects
3. Technology Stack Alignment: Hands-on experience with required technologies
4. Progressive Responsibility: Career growth and increasing responsibilities
5. Applied Learning: Real-world application of academic knowledge

STUDENT EXPERIENCE DATA:
- Work Experience: {work_experiences}
- GitHub Projects: {github_projects}
- Portfolio Projects: {portfolio_projects}
- Internships: {internships}
- Academic Projects: {academic_projects}

JOB EXPERIENCE REQUIREMENTS:
- Required Experience Level: {job.experienceLevel}
- Industry Requirements: {job.industryExperience}
- Technology Requirements: {job.requiredTechnologies}
- Project Scale Expectations: {job.projectComplexity}

Provide an experience match score (1-100) considering:
- Relevance of past experience
- Depth of technical exposure
- Project impact and scale
- Career progression trajectory

Return only the numeric score followed by a brief explanation.
```

### 7.2 Enhanced Cover Letter Generation

#### Advanced Cover Letter Prompt
```
You are an expert career advisor and professional writer specializing in compelling cover letter creation. Generate a personalized, ATS-optimized cover letter that tells a compelling story.

COVER LETTER REQUIREMENTS:
1. Professional formatting with proper business letter structure
2. Compelling opening that captures attention
3. Specific examples demonstrating value proposition
4. Quantified achievements where possible
5. Clear call-to-action and enthusiasm for the role
6. ATS-friendly keywords integration
7. Professional tone matching company culture

PERSONALIZATION DATA:
Student Profile: {detailed_student_data}
Job Details: {comprehensive_job_data}
Company Research: {company_information}
Match Analysis: {skill_match_analysis}

WRITING GUIDELINES:
- Use active voice and strong action verbs
- Include specific examples with quantifiable results
- Demonstrate knowledge of company and role
- Show progression and growth mindset
- Address any potential concerns proactively
- End with confident, professional closing

Generate a compelling cover letter that positions this candidate as the ideal fit for the role.
```

### 7.3 Dynamic CV Generation Prompts

#### Section-Specific Optimization
```
You are an AI resume optimizer specializing in {section_type} sections. Optimize this resume section for maximum impact and ATS compatibility.

OPTIMIZATION CRITERIA FOR {section_type}:
1. Keyword optimization for target role
2. Quantified achievements and impact
3. Action-verb driven descriptions
4. Industry-standard formatting
5. Relevance ranking and prioritization

ORIGINAL CONTENT: {original_section_content}
TARGET ROLE: {job_title_and_description}
INDUSTRY CONTEXT: {industry_requirements}

Rewrite this section to:
- Maximize relevance to target role
- Include industry-specific keywords
- Quantify achievements where possible
- Use impactful action verbs
- Ensure ATS compatibility

Return the optimized section with improved formatting and content.
```

## Database Migration Scripts

### 8.1 Migration V4: Match Score Components
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/resources/db/migration/V4__add_match_score_components.sql`
**Status**: NEW FILE

### 8.2 Migration V5: Skills System
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/resources/db/migration/V5__add_skills_system.sql`
**Status**: NEW FILE

### 8.3 Migration V6: CV Templates
**File**: `JavaSpringBootOAuth2JwtCrud/src/main/resources/db/migration/V6__add_cv_templates.sql`
**Status**: NEW FILE

## Testing Strategy

### 8.4 Backend Tests
**Files to Add**:
- `JobMatchServiceTest.java` - Multi-factor scoring tests
- `EmailRedirectServiceTest.java` - Email generation tests
- `SkillsServiceTest.java` - Skills management tests
- `CVGenerationServiceTest.java` - Template generation tests

### 8.5 Frontend Tests
**Files to Add**:
- `MatchScoreBreakdown.test.tsx`
- `CVBuilder.test.tsx`
- `SkillsManager.test.tsx`
- `MatchScoreWarning.test.tsx`

## Deployment Considerations

### 8.6 Environment Variables
Add to `application.properties`:
```properties
# Email redirect settings
ojtech.email.redirect.enabled=true
ojtech.email.gmail.base-url=https://mail.google.com/mail/u/0/#compose

# CV template settings
ojtech.cv.templates.storage-path=/templates/cv/
ojtech.cv.max-templates=10

# Match scoring weights
ojtech.matching.personality.weight=0.3
ojtech.matching.skills.weight=0.4
ojtech.matching.experience.weight=0.3
ojtech.matching.low-score-threshold=40
```

### 8.7 Performance Optimizations
- Implement caching for CV template rendering
- Add background job processing for match score calculations
- Optimize database queries with proper indexing
- Implement lazy loading for large skill datasets

## Rollout Plan

### Phase 1: Foundation (Weeks 1-2)
1. Database migrations
2. Backend entity updates
3. Basic repository and service implementations

### Phase 2: Core Features (Weeks 3-4)
1. Multi-factor scoring implementation
2. CV template system
3. Skills management system

### Phase 3: User Experience (Weeks 5-6)
1. Frontend component development
2. Email redirect functionality
3. Warning systems and notifications

### Phase 4: Integration & Testing (Weeks 7-8)
1. End-to-end testing
2. Performance optimization
3. User acceptance testing

### Phase 5: Deployment (Week 9)
1. Production deployment
2. User training
3. Monitoring and feedback collection

## Success Metrics

### 8.8 Key Performance Indicators
1. **Match Accuracy**: Improved match score accuracy (target: >85% user satisfaction)
2. **Application Success Rate**: Increased application-to-interview conversion (target: +25%)
3. **User Engagement**: Higher swipe-to-apply conversion (target: +40%)
4. **CV Quality**: Reduced CV bounce rate from employers (target: -30%)
5. **Feature Adoption**: Skills categorization usage (target: >80% of active users)

### 8.9 Monitoring & Analytics
- Implement tracking for all new features
- A/B test different warning thresholds
- Monitor email redirect success rates
- Track CV template popularity and effectiveness

## Summary

This implementation plan provides a comprehensive roadmap for enhancing OJTech with advanced matching capabilities, improved user experience, and modern CV generation features. The phased approach ensures manageable development cycles while delivering measurable value to users.

### Files Summary:
- **New Files**: 47 files (23 backend, 18 frontend, 6 database migrations)
- **Modified Files**: 15 files (8 backend, 7 frontend)
- **Total Impact**: 62 files across the entire codebase

The implementation emphasizes user experience, data-driven matching, and modern web standards while maintaining the existing architecture's stability and performance.
