package com.ojtech.api.controller;

import com.ojtech.api.model.ERole;
import com.ojtech.api.model.Profile;
import com.ojtech.api.model.Role;
import com.ojtech.api.model.User;
import com.ojtech.api.model.UserRole;
import com.ojtech.api.payload.request.LoginRequest;
import com.ojtech.api.payload.request.SignupRequest;
import com.ojtech.api.payload.response.JwtResponse;
import com.ojtech.api.payload.response.MessageResponse;
import com.ojtech.api.repository.RoleRepository;
import com.ojtech.api.repository.UserRepository;
import com.ojtech.api.security.UserDetailsImpl;
import com.ojtech.api.security.jwt.JwtUtils;
import com.ojtech.api.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final ProfileService profileService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder encoder, JwtUtils jwtUtils, ProfileService profileService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.profileService = profileService;
    }

    @PostMapping("/signin")
    @Operation(summary = "Login", description = "Authenticate a user and generate a JWT token")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt with usernameOrEmail: {}", loginRequest.getUsernameOrEmail());
        
        try {
            // Check if the user exists in the database before authentication
            boolean userExists = false;
            try {
                userExists = userRepository.existsByEmail(loginRequest.getUsernameOrEmail()) || 
                          userRepository.existsByUsername(loginRequest.getUsernameOrEmail());
                log.info("User exists check for {}: {}", loginRequest.getUsernameOrEmail(), userExists);
            } catch (Exception e) {
                log.warn("Error checking if user exists: {}", e.getMessage());
            }
            
            // Proceed with authentication
            log.debug("Creating authentication token with username: {} and password length: {}", 
                     loginRequest.getUsernameOrEmail(), 
                     loginRequest.getPassword() != null ? loginRequest.getPassword().length() : 0);
                     
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));

            log.info("Authentication successful for: {}", loginRequest.getUsernameOrEmail());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

            log.info("Login successful for user: {}, roles: {}", userDetails.getUsername(), roles);

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 userDetails.getEmail(), 
                                                 roles));
        } catch (Exception e) {
            log.error("Login failed for usernameOrEmail: {}, error: {}", loginRequest.getUsernameOrEmail(), e.getMessage());
            log.error("Detailed error:", e);
            throw e;
        }
    }

    @PostMapping("/signup")
    @Operation(summary = "Register", description = "Register a new user")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        log.info("Registration attempt with username: {}, email: {}, roles: {}", 
                 signUpRequest.getUsername(), signUpRequest.getEmail(), signUpRequest.getRoles());
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            log.warn("Registration failed: Username already taken: {}", signUpRequest.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            log.warn("Registration failed: Email already in use: {}", signUpRequest.getEmail());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        try {
        // Create new user's account
            String encodedPassword = encoder.encode(signUpRequest.getPassword());
            log.debug("Password encoded for user {}: {}", signUpRequest.getEmail(), encodedPassword.substring(0, 10) + "...");

            // Determine the profile role first
            UserRole profileRole = UserRole.STUDENT; // Default role
        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

            if (strRoles != null && !strRoles.isEmpty()) {
                // Check if admin role is present
                if (strRoles.stream().anyMatch(r -> r.equalsIgnoreCase("admin"))) {
                    profileRole = UserRole.ADMIN;
                }
                // Check if employer role is present
                else if (strRoles.stream().anyMatch(r -> r.equalsIgnoreCase("employer"))) {
                    profileRole = UserRole.EMPLOYER;
                }
                // Otherwise, it stays as STUDENT (default)
            }

            // Now handle the roles for the User entity
        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role STUDENT is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found."));
                        roles.add(adminRole);
                        break;
                    case "employer":
                        Role modRole = roleRepository.findByName(ERole.ROLE_EMPLOYER)
                                .orElseThrow(() -> new RuntimeException("Error: Role EMPLOYER is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                                .orElseThrow(() -> new RuntimeException("Error: Role STUDENT is not found."));
                        roles.add(userRole);
                }
            });
        }

            // Create a corresponding Profile entity FIRST
            Profile profile = new Profile();
            profile.setEmail(signUpRequest.getEmail()); // IMPORTANT: Set the email that will be used for login
            profile.setPassword(encodedPassword); // Use the encoded password
            profile.setFullName(signUpRequest.getUsername()); // Use username as default full name
            profile.setRole(profileRole); // Use the determined role
            profile.setEnabled(true);
            profile.setHasCompletedOnboarding(false);
            
            log.info("Creating profile with email: {}, role: {}", profile.getEmail(), profile.getRole());
            
            // Save the profile first
            Profile savedProfile = profileService.saveProfile(profile);
            log.info("Profile saved successfully with ID: {}", savedProfile.getId());
            
            // Now create the User entity and link it to the profile
            User user = new User(signUpRequest.getUsername(), 
                                 signUpRequest.getEmail(),
                                 encodedPassword);
        user.setRoles(roles);
        user.setEnabled(true); 
            user.setProfile(savedProfile); // Link to the saved profile
            
            // Save the user
            User savedUser = userRepository.save(user);
            log.info("User saved successfully with ID: {}", savedUser.getId());
            
            // Update the profile with a reference to the user
            savedProfile.setUser(savedUser);
            profileService.saveProfile(savedProfile);
            log.info("Profile updated with user reference");
            
            // Verify the profile has the correct email and password
            log.info("Verifying profile data - Email: {}, Has Password: {}, Role: {}", 
                    savedProfile.getEmail(), 
                    savedProfile.getPassword() != null && !savedProfile.getPassword().isEmpty(),
                    savedProfile.getRole());

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            log.error("Registration error for username: {}, email: {}, error: {}", 
                      signUpRequest.getUsername(), signUpRequest.getEmail(), e.getMessage(), e);
            throw e;
        }
    }
} 