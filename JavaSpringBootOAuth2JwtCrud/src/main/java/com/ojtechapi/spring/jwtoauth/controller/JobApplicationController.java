package com.ojtechapi.spring.jwtoauth.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ojtechapi.spring.jwtoauth.dtos.EmailDraftDTO;
import com.ojtechapi.spring.jwtoauth.dtos.responses.JobApplicationResponseDTO;
import com.ojtechapi.spring.jwtoauth.dtos.responses.MessageResponse;
import com.ojtechapi.spring.jwtoauth.entities.ApplicationStatus;
import com.ojtechapi.spring.jwtoauth.entities.CV;
import com.ojtechapi.spring.jwtoauth.entities.Job;
import com.ojtechapi.spring.jwtoauth.entities.JobApplication;
import com.ojtechapi.spring.jwtoauth.entities.JobMatch;
import com.ojtechapi.spring.jwtoauth.entities.NLOProfile;
import com.ojtechapi.spring.jwtoauth.entities.StudentEmailTracking;
import com.ojtechapi.spring.jwtoauth.entities.StudentProfile;
import com.ojtechapi.spring.jwtoauth.exceptions.BadRequestException;
import com.ojtechapi.spring.jwtoauth.exceptions.ResourceNotFoundException;
import com.ojtechapi.spring.jwtoauth.repositories.CVRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobApplicationRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobMatchRepository;
import com.ojtechapi.spring.jwtoauth.repositories.JobRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentEmailTrackingRepository;
import com.ojtechapi.spring.jwtoauth.repositories.StudentProfileRepository;
import com.ojtechapi.spring.jwtoauth.security.services.UserDetailsImpl;
import com.ojtechapi.spring.jwtoauth.service.EmailService;
import com.ojtechapi.spring.jwtoauth.services.CoverLetterService;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Value("${backend.base-url}")
    private String baseUrl;
    
    @Value("${frontend.base-url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CVRepository cvRepository;
    
    @Autowired
    private CoverLetterService coverLetterService;
    
    @Autowired
    private JobMatchRepository jobMatchRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private StudentEmailTrackingRepository emailTrackingRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobApplicationResponseDTO>> getStudentApplications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();
        List<JobApplication> applications = jobApplicationRepository.findByStudent(studentProfile);
        List<JobApplicationResponseDTO> responseDTOs = applications.stream()
            .map(JobApplicationResponseDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForJob(@PathVariable UUID jobId, @RequestBody(required = false) Map<String, String> applicationData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();
        
        // Note: Verification check removed - frontend handles warnings for unverified students
        // Students can browse jobs but see warnings about uploading documents and verification status
        // However, they should still be able to apply (admin will review applications from unverified students)

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }

        Job job = jobOpt.get();

        // Check if already applied WITH EMAIL SENT (alreadyApplied = true)
        // Allow creating new application if previous one has emailSent = false
        Optional<JobApplication> existingApplication = jobApplicationRepository.findByStudentAndJob(studentProfile, job);
        if (existingApplication.isPresent()) {
            JobApplication existing = existingApplication.get();
            // Only block if email was already sent
            if (existing.getEmailSent() != null && existing.getEmailSent()) {
                throw new BadRequestException("You have already applied for this job");
            }
            // If email was NOT sent, delete the old pending application and create a new one
            jobApplicationRepository.delete(existing);
            System.out.println("Deleted pending application (email not sent) for job: " + job.getId());
        }

        // Initialize application data if null
        if (applicationData == null) {
            applicationData = new HashMap<>();
        }

        // Get CV (use active CV if not specified)
        UUID cvId = null;
        if (applicationData.containsKey("cvId")) {
            cvId = UUID.fromString(applicationData.get("cvId"));
        } else if (studentProfile.getActiveCvId() != null) {
            cvId = studentProfile.getActiveCvId();
        } else {
            throw new BadRequestException("No active CV found. Please set an active CV in your profile.");
        }

        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResourceNotFoundException("CV not found");
        }

        CV cv = cvOpt.get();
        
        // Always generate a cover letter automatically
        String coverLetter = coverLetterService.generateCoverLetter(studentProfile.getId(), jobId, cvId);

        // Create application with PENDING status (appliedAt and lastUpdatedAt will be set after email is sent)
        JobApplication application = new JobApplication();
        application.setStudent(studentProfile);
        application.setJob(job);
        application.setCv(cv);
        application.setCoverLetter(coverLetter);
        // Do not set appliedAt and lastUpdatedAt yet - they will be set when email is successfully sent

        application = jobApplicationRepository.save(application);
        
        // Find and mark any job matches as viewed
        List<JobMatch> jobMatches = jobMatchRepository.findByStudentIdAndJobId(studentProfile.getId(), jobId);
        if (!jobMatches.isEmpty()) {
            for (JobMatch match : jobMatches) {
                match.setViewed(true);
                jobMatchRepository.save(match);
            }
        }

        return ResponseEntity.ok(new JobApplicationResponseDTO(application));
    }

    @GetMapping("/{applicationId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<JobApplicationResponseDTO> getApplicationById(@PathVariable UUID applicationId) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }

        JobApplication application = applicationOpt.get();
        
        // Check if the user is authorized to view this application
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        // Students can only view their own applications
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty() || !application.getStudent().getId().equals(studentProfileOpt.get().getId())) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(new JobApplicationResponseDTO(application));
    }

    @DeleteMapping("/{applicationId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> withdrawApplication(@PathVariable UUID applicationId) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }

        JobApplication application = applicationOpt.get();
        
        // Check if the student owns the application
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty() || !application.getStudent().getId().equals(studentProfileOpt.get().getId())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Only allow withdrawal if status is PENDING
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Cannot withdraw application that is already being processed");
        }

        jobApplicationRepository.delete(application);
        
        return ResponseEntity.ok(new MessageResponse("Application withdrawn successfully"));
    }

    @PostMapping("/generate-cover-letter/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> generateCoverLetter(@PathVariable UUID jobId, @RequestBody Map<String, String> requestData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }

        StudentProfile studentProfile = studentProfileOpt.get();

        // Get CV
        UUID cvId = null;
        if (requestData.containsKey("cvId")) {
            cvId = UUID.fromString(requestData.get("cvId"));
        } else if (studentProfile.getActiveCvId() != null) {
            cvId = studentProfile.getActiveCvId();
        } else {
            throw new BadRequestException("No CV provided or set as active");
        }

        // Generate cover letter
        String coverLetter = coverLetterService.generateCoverLetter(studentProfile.getId(), jobId, cvId);
        
        return ResponseEntity.ok(Map.of("coverLetter", coverLetter));
    }
    
    @GetMapping("/{applicationId}/prepare-email")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EmailDraftDTO> prepareApplicationEmail(@PathVariable UUID applicationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }
        
        JobApplication application = applicationOpt.get();
        
        // Check if the student owns the application
        if (!application.getStudent().getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this application");
        }
        
        StudentProfile student = application.getStudent();
        Job job = application.getJob();
        NLOProfile employer = job.getEmployer();
        CV cv = application.getCv();
        
        // Build email draft
        String studentName = student.getFirstName() + " " + student.getLastName();
        String emailBody = generateEmailBody(studentName, job.getTitle(), application.getCoverLetter());
        String subject = "Job Application for " + job.getTitle() + " - " + studentName;
        
        // Generate CV view URL - points to frontend public viewer
        String cvUrl = frontendUrl + "/cv/" + cv.getId();
        
        // Get email from User entity (primary source) or fallback to StudentProfile email
        String studentEmail = student.getUser() != null ? student.getUser().getEmail() : student.getEmail();
        
        // Get phone from Profile.phoneNumber (primary) or fallback to StudentProfile.phone
        String studentPhone = student.getPhoneNumber() != null ? student.getPhoneNumber() : student.getPhone();
        
        // Determine recipient email and name - prioritize company HR if available
        String recipientEmail;
        String recipientName;
        
        if (job.getCompany() != null && job.getCompany().getHrEmail() != null) {
            // Use company HR contact if job is associated with a company
            recipientEmail = job.getCompany().getHrEmail();
            recipientName = job.getCompany().getHrName() != null ? job.getCompany().getHrName() : "Hiring Manager";
        } else {
            // Fallback to employer profile contact
            recipientEmail = employer.getContactPersonEmail();
            recipientName = employer.getContactPersonName();
        }
        
        EmailDraftDTO draft = new EmailDraftDTO(
            recipientEmail,
            recipientName,
            subject,
            emailBody,
            cvUrl,
            studentName,
            studentEmail,
            studentPhone,
            student.getUniversity(),
            student.getMajor()
        );
        
        return ResponseEntity.ok(draft);
    }
    
    @PostMapping(value = "/{applicationId}/send-email", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> sendApplicationEmail(
            @PathVariable UUID applicationId, 
            @RequestParam("subject") String subject,
            @RequestParam("emailBody") String emailBody,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new ResourceNotFoundException("Application not found");
        }
        
        JobApplication application = applicationOpt.get();
        
        // Check if the student owns the application
        if (!application.getStudent().getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this application");
        }
        
        StudentProfile student = application.getStudent();
        
        // Check rate limiting - max 10 emails per day
        LocalDate today = LocalDate.now();
        Optional<StudentEmailTracking> trackingOpt = emailTrackingRepository.findByStudentIdAndEmailDate(student.getId(), today);
        
        StudentEmailTracking tracking;
        if (trackingOpt.isPresent()) {
            tracking = trackingOpt.get();
            if (tracking.getEmailCount() >= 10) {
                throw new BadRequestException("Daily email limit reached (10 emails per day). Please try again tomorrow.");
            }
        } else {
            tracking = new StudentEmailTracking(student.getId(), today);
        }
        
        // Check if email already sent for this application
        if (Boolean.TRUE.equals(application.getEmailSent())) {
            throw new BadRequestException("Email already sent for this application");
        }
        
        Job job = application.getJob();
        NLOProfile employer = job.getEmployer();
        CV cv = application.getCv();
        
        String studentName = student.getFirstName() + " " + student.getLastName();
        
        // Generate CV view URL - points to frontend public viewer
        String cvUrl = frontendUrl + "/cv/" + cv.getId();
        
        // Get email from User entity (primary source) or fallback to StudentProfile email
        String studentEmail = student.getUser() != null ? student.getUser().getEmail() : student.getEmail();
        
        // Get phone from Profile.phoneNumber (primary) or fallback to StudentProfile.phone
        String studentPhone = student.getPhoneNumber() != null ? student.getPhoneNumber() : student.getPhone();
        
        // Determine recipient email and name - prioritize company HR if available
        String recipientEmail;
        String recipientName;
        String companyName;
        
        if (job.getCompany() != null && job.getCompany().getHrEmail() != null) {
            // Use company HR contact if job is associated with a company
            recipientEmail = job.getCompany().getHrEmail();
            recipientName = job.getCompany().getHrName() != null ? job.getCompany().getHrName() : "Hiring Manager";
            companyName = job.getCompany().getName();
        } else {
            // Fallback to employer profile contact
            recipientEmail = employer.getContactPersonEmail();
            recipientName = employer.getContactPersonName();
            companyName = employer.getCompanyName();
        }
        
        try {
            // Send email - this must succeed before we update the application status
            emailService.sendJobApplicationEmail(
                recipientEmail,
                recipientName,
                studentName,
                studentEmail,
                studentPhone,
                student.getUniversity(),
                student.getMajor(),
                job.getTitle(),
                companyName,
                application.getCoverLetter(),
                cvUrl,
                emailBody,
                attachments
            );
            
            // Email sent successfully - now update application status to APPLIED
            LocalDateTime now = LocalDateTime.now();
            application.setEmailSent(true);
            application.setEmailSentAt(now);
            application.setEmailBody(emailBody);
            application.setEmailSubject(subject);
            application.setStatus(ApplicationStatus.APPLIED); // Status only changes after successful email
            application.setAppliedAt(now); // Set appliedAt when email is successfully sent
            application.setLastUpdatedAt(now); // Set lastUpdatedAt when email is successfully sent
            jobApplicationRepository.save(application);
            
            // Increment email count
            tracking.incrementEmailCount();
            emailTrackingRepository.save(tracking);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application email sent successfully",
                "emailsSentToday", tracking.getEmailCount(),
                "emailsRemaining", 10 - tracking.getEmailCount()
            ));
        } catch (Exception e) {
            // Email failed - application remains in PENDING status
            throw new BadRequestException("Failed to send email: " + e.getMessage());
        }
    }
    
    private String generateEmailBody(String studentName, String jobTitle, String coverLetter) {
        // If a cover letter is provided, use it as-is since it's already a complete, formatted letter
        if (coverLetter != null && !coverLetter.trim().isEmpty()) {
            return coverLetter;
        }
        
        // Otherwise, generate a basic email body
        return String.format(
            "I am writing to express my interest in the %s position.\n\n" +
            "Please find my application materials attached.\n\n" +
            "I have attached my CV for your review. I would welcome the opportunity to discuss how my skills align with your needs.\n\n" +
            "Thank you for considering my application.\n\nBest regards,\n%s",
            jobTitle, studentName
        );
    }
    
    /**
     * Apply for a job and send email to employer in one atomic operation.
     * This endpoint:
     * 1. Validates student profile and job existence
     * 2. Checks for duplicate applications
     * 3. Enforces daily email rate limiting (10 emails/day)
     * 4. Sends email to employer with job application
     * 5. Creates job application record only if email is sent successfully
     * 
     * @param jobId The ID of the job to apply for
     * @param subject Email subject line
     * @param emailBody Custom email body content
     * @param attachments Optional file attachments (e.g., portfolio, certificates)
     * @return Success response with email tracking information
     */
    @PostMapping(value = "/apply-and-send/{jobId}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyAndSendEmail(
            @PathVariable UUID jobId,
            @RequestParam("subject") String subject,
            @RequestParam("emailBody") String emailBody,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {
        
        System.out.println("=== Apply and Send Email Request ===");
        System.out.println("Job ID: " + jobId);
        System.out.println("Subject: " + subject);
        System.out.println("Has attachments: " + (attachments != null && attachments.length > 0));
        
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UUID userId = userDetails.getId();

        // Get student profile
        Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUserId(userId);
        if (studentProfileOpt.isEmpty()) {
            throw new ResourceNotFoundException("Student profile not found");
        }
        StudentProfile studentProfile = studentProfileOpt.get();
        System.out.println("Student: " + studentProfile.getFirstName() + " " + studentProfile.getLastName());

        // Get job
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new ResourceNotFoundException("Job not found");
        }
        Job job = jobOpt.get();
        System.out.println("Job: " + job.getTitle() + " at " + 
            (job.getCompany() != null ? job.getCompany().getName() : job.getEmployer().getCompanyName()));

        // Check if already applied WITH EMAIL SENT
        Optional<JobApplication> existingApplication = jobApplicationRepository.findByStudentAndJob(studentProfile, job);
        if (existingApplication.isPresent()) {
            JobApplication existing = existingApplication.get();
            if (existing.getEmailSent() != null && existing.getEmailSent()) {
                throw new BadRequestException("You have already applied for this job");
            }
            // Delete old pending application that didn't send email
            jobApplicationRepository.delete(existing);
            System.out.println("Deleted pending application (email not sent) for job: " + job.getId());
        }

        // Get active CV
        UUID cvId = studentProfile.getActiveCvId();
        if (cvId == null) {
            throw new BadRequestException("No active CV found. Please set an active CV in your profile.");
        }

        Optional<CV> cvOpt = cvRepository.findById(cvId);
        if (cvOpt.isEmpty()) {
            throw new ResourceNotFoundException("CV not found");
        }
        CV cv = cvOpt.get();
        System.out.println("Using CV ID: " + cv.getId());
        
        // Generate cover letter automatically
        String coverLetter = coverLetterService.generateCoverLetter(studentProfile.getId(), jobId, cvId);
        System.out.println("Generated cover letter (length: " + coverLetter.length() + " chars)");

        // Check daily email rate limit (10 emails per day)
        LocalDate today = LocalDate.now();
        Optional<StudentEmailTracking> trackingOpt = emailTrackingRepository.findByStudentIdAndEmailDate(studentProfile.getId(), today);
        
        StudentEmailTracking tracking;
        if (trackingOpt.isPresent()) {
            tracking = trackingOpt.get();
            if (tracking.getEmailCount() >= 10) {
                throw new BadRequestException("Daily email limit reached (10 emails per day). Please try again tomorrow.");
            }
            System.out.println("Current email count today: " + tracking.getEmailCount() + "/10");
        } else {
            tracking = new StudentEmailTracking(studentProfile.getId(), today);
            System.out.println("Creating new email tracking for today");
        }

        // Prepare student information
        String studentName = studentProfile.getFirstName() + " " + studentProfile.getLastName();
        // Generate CV view URL - points to frontend public viewer
        String cvUrl = frontendUrl + "/cv/" + cv.getId();
        System.out.println("Generated CV URL: " + cvUrl);
        System.out.println("   Frontend URL: " + frontendUrl);
        System.out.println("   CV ID: " + cv.getId());
        String studentEmail = studentProfile.getUser() != null ? studentProfile.getUser().getEmail() : studentProfile.getEmail();
        String studentPhone = studentProfile.getPhoneNumber() != null ? studentProfile.getPhoneNumber() : studentProfile.getPhone();
        
        // Determine recipient (Company HR or Employer/NLO)
        String recipientEmail;
        String recipientName;
        String companyName;
        
        if (job.getCompany() != null && job.getCompany().getHrEmail() != null) {
            // Send to company HR email
            recipientEmail = job.getCompany().getHrEmail();
            recipientName = job.getCompany().getHrName() != null ? job.getCompany().getHrName() : "Hiring Manager";
            companyName = job.getCompany().getName();
            System.out.println("Sending to Company HR: " + recipientName + " <" + recipientEmail + ">");
        } else {
            // Send to employer/NLO contact
            NLOProfile employer = job.getEmployer();
            recipientEmail = employer.getContactPersonEmail();
            recipientName = employer.getContactPersonName();
            companyName = employer.getCompanyName();
            System.out.println("Sending to Employer: " + recipientName + " <" + recipientEmail + ">");
        }
        
        try {
            // STEP 1: Send email FIRST - if this fails, no application is created
            // This uses the same email sending logic as the send-email endpoint
            System.out.println("Sending job application email...");
            emailService.sendJobApplicationEmail(
                recipientEmail,
                recipientName,
                studentName,
                studentEmail,
                studentPhone,
                studentProfile.getUniversity(),
                studentProfile.getMajor(),
                job.getTitle(),
                companyName,
                coverLetter,
                cvUrl,
                emailBody,  // Custom email body from student
                attachments // Optional file attachments
            );
            System.out.println("✅ Email sent successfully!");
            
            // STEP 2: Email sent successfully - NOW create the application record with APPLIED status
            LocalDateTime now = LocalDateTime.now();
            JobApplication application = new JobApplication();
            application.setStudent(studentProfile);
            application.setJob(job);
            application.setCv(cv);
            application.setCoverLetter(coverLetter);
            application.setEmailSent(true);
            application.setEmailSentAt(now);
            application.setEmailBody(emailBody);
            application.setEmailSubject(subject);
            application.setStatus(ApplicationStatus.APPLIED); // Status only changes after successful email
            application.setAppliedAt(now); // Set appliedAt when email is successfully sent
            application.setLastUpdatedAt(now); // Set lastUpdatedAt when email is successfully sent
            jobApplicationRepository.save(application);
            System.out.println("✅ Job application record created");
            
            // STEP 3: Mark job matches as viewed
            List<JobMatch> jobMatches = jobMatchRepository.findByStudentIdAndJobId(studentProfile.getId(), jobId);
            for (JobMatch match : jobMatches) {
                match.setViewed(true);
                jobMatchRepository.save(match);
            }
            if (!jobMatches.isEmpty()) {
                System.out.println("✅ Marked " + jobMatches.size() + " job match(es) as viewed");
            }
            
            // STEP 4: Increment email count
            tracking.incrementEmailCount();
            emailTrackingRepository.save(tracking);
            System.out.println("✅ Email count updated: " + tracking.getEmailCount() + "/10");
            
            System.out.println("=== Application Submitted Successfully ===");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application email sent successfully",
                "emailsSentToday", tracking.getEmailCount(),
                "emailsRemaining", 10 - tracking.getEmailCount()
            ));
        } catch (Exception e) {
            // Email failed - application remains in PENDING status (or no application is created)
            System.err.println("❌ Failed to send email: " + e.getMessage());
            e.printStackTrace();
            throw new BadRequestException("Failed to send email: " + e.getMessage());
        }
    }
}
