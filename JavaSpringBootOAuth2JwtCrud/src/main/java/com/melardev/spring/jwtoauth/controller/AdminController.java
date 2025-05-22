package com.melardev.spring.jwtoauth.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melardev.spring.jwtoauth.dtos.responses.MessageResponse;
import com.melardev.spring.jwtoauth.entities.ERole;
import com.melardev.spring.jwtoauth.entities.Job;
import com.melardev.spring.jwtoauth.entities.JobApplication;
import com.melardev.spring.jwtoauth.entities.Role;
import com.melardev.spring.jwtoauth.entities.User;
import com.melardev.spring.jwtoauth.repositories.RoleRepository;
import com.melardev.spring.jwtoauth.repositories.UserRepository;
import com.melardev.spring.jwtoauth.repositories.JobRepository;
import com.melardev.spring.jwtoauth.repositories.JobApplicationRepository;
import com.melardev.spring.jwtoauth.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/paginated")
    public ResponseEntity<?> getPaginatedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<User> usersPage = userRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", usersPage.getContent());
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> userData) {
        try {
            String username = userData.get("username");
            String email = userData.get("email");
            String password = userData.get("password");
            String roleName = userData.get("role");
            
            if (username == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username, email and password are required"));
            }
            
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username already exists"));
            }
            
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email already exists"));
            }
            
            User user = new User(username, email, passwordEncoder.encode(password));
            
            // Set role
            ERole eRole = ERole.ROLE_STUDENT; // Default
            if (roleName != null) {
                switch (roleName.toLowerCase()) {
                    case "admin":
                        eRole = ERole.ROLE_ADMIN;
                        break;
                    case "employer":
                        eRole = ERole.ROLE_EMPLOYER;
                        break;
                }
            }
            
            Optional<Role> roleOpt = roleRepository.findByName(eRole);
            if (roleOpt.isPresent()) {
                user.getRoles().add(roleOpt.get());
            }
            
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userOpt.get());
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody Map<String, Object> userData) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        // Update fields if present in request
        if (userData.containsKey("username")) {
            String newUsername = (String) userData.get("username");
            if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username already in use"));
            }
            user.setUsername((String) userData.get("username"));
        }
        
        if (userData.containsKey("email")) {
            String newEmail = (String) userData.get("email");
            if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email already in use"));
            }
            user.setEmail(newEmail);
        }
        
        if (userData.containsKey("password")) {
            user.setPassword(passwordEncoder.encode((String) userData.get("password")));
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User updated successfully"));
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
    
    @PutMapping("/users/{id}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable UUID id, @RequestBody List<String> roles) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        user.getRoles().clear();
        
        for (String roleName : roles) {
            ERole eRole;
            switch (roleName.toLowerCase()) {
                case "admin":
                    eRole = ERole.ROLE_ADMIN;
                    break;
                case "employer":
                    eRole = ERole.ROLE_EMPLOYER;
                    break;
                case "student":
                    eRole = ERole.ROLE_STUDENT;
                    break;
                default:
                    continue;
            }
            
            Optional<Role> roleOpt = roleRepository.findByName(eRole);
            if (roleOpt.isPresent()) {
                user.getRoles().add(roleOpt.get());
            }
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User roles updated successfully"));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        long userCount = userRepository.count();
        long jobCount = jobRepository.count();
        long applicationCount = jobApplicationRepository.count();
        
        return ResponseEntity.ok(
            java.util.Map.of(
                "totalUsers", userCount,
                "totalJobs", jobCount,
                "totalApplications", applicationCount
            )
        );
    }
    
    @GetMapping("/stats/detailed")
    public ResponseEntity<?> getDetailedStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);
        
        // Role distribution
        Map<String, Long> userDistribution = new HashMap<>();
        
        Optional<Role> adminRoleOpt = roleRepository.findByName(ERole.ROLE_ADMIN);
        Optional<Role> employerRoleOpt = roleRepository.findByName(ERole.ROLE_EMPLOYER);
        Optional<Role> studentRoleOpt = roleRepository.findByName(ERole.ROLE_STUDENT);
        
        // Count users by iterating through all users and checking roles
        // Not efficient for large datasets, but works for this demo
        long adminCount = 0;
        long employerCount = 0;
        long studentCount = 0;
        
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            Set<Role> userRoles = user.getRoles();
            
            if (adminRoleOpt.isPresent() && userRoles.contains(adminRoleOpt.get())) {
                adminCount++;
            }
            
            if (employerRoleOpt.isPresent() && userRoles.contains(employerRoleOpt.get())) {
                employerCount++;
            }
            
            if (studentRoleOpt.isPresent() && userRoles.contains(studentRoleOpt.get())) {
                studentCount++;
            }
        }
        
        userDistribution.put("admin", adminCount);
        userDistribution.put("employer", employerCount);
        userDistribution.put("student", studentCount);
        stats.put("userDistribution", userDistribution);
        
        // Job statistics
        long totalJobs = jobRepository.count();
        stats.put("totalJobs", totalJobs);
        
        // Application statistics
        long totalApplications = jobApplicationRepository.count();
        stats.put("totalApplications", totalApplications);
        
        // Return all statistics
        return ResponseEntity.ok(stats);
    }
    
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable UUID id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        
        String status = user.isEnabled() ? "enabled" : "disabled";
        return ResponseEntity.ok(new MessageResponse("User " + status + " successfully"));
    }
    
    // Jobs Management
    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobsPage = jobRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("jobs", jobsPage.getContent());
        response.put("currentPage", jobsPage.getNumber());
        response.put("totalItems", jobsPage.getTotalElements());
        response.put("totalPages", jobsPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable UUID id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        jobRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
    }
    
    // Job Applications Management
    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<JobApplication> applicationsPage = jobApplicationRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("applications", applicationsPage.getContent());
        response.put("currentPage", applicationsPage.getNumber());
        response.put("totalItems", applicationsPage.getTotalElements());
        response.put("totalPages", applicationsPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable UUID id) {
        Optional<JobApplication> applicationOpt = jobApplicationRepository.findById(id);
        if (applicationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(applicationOpt.get());
    }
    
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable UUID id) {
        if (!jobApplicationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        jobApplicationRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Job application deleted successfully"));
    }

    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        List<User> users;
        
        // Simple implementation - in a real application, you would use 
        // more sophisticated search with a custom repository method
        if (query != null && !query.isEmpty()) {
            // Search by username or email containing the query (case insensitive)
            users = userRepository.findAll().stream()
                    .filter(user -> 
                        user.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                        user.getEmail().toLowerCase().contains(query.toLowerCase()))
                    .skip(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .collect(java.util.stream.Collectors.toList());
            
            long totalCount = userRepository.findAll().stream()
                    .filter(user -> 
                        user.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                        user.getEmail().toLowerCase().contains(query.toLowerCase()))
                    .count();
                    
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("currentPage", page);
            response.put("totalItems", totalCount);
            response.put("totalPages", (int) Math.ceil((double) totalCount / size));
            
            return ResponseEntity.ok(response);
        } else {
            // No query, return paginated list of all users
            Page<User> usersPage = userRepository.findAll(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", usersPage.getContent());
            response.put("currentPage", usersPage.getNumber());
            response.put("totalItems", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());
            
            return ResponseEntity.ok(response);
        }
    }
} 