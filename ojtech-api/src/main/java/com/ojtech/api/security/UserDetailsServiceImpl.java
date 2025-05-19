package com.ojtech.api.security;

import com.ojtech.api.model.Profile;
import com.ojtech.api.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);
    private final ProfileRepository profileRepository;
    
    public UserDetailsServiceImpl(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        log.info("Attempting to load user by usernameOrEmail: {}", usernameOrEmail);
        
        try {
            // First try to look up profile by email
            log.info("Searching for profile with email: {}", usernameOrEmail);
            Optional<Profile> profileOpt = profileRepository.findByEmail(usernameOrEmail);
            
            if (profileOpt.isPresent()) {
                Profile profile = profileOpt.get();
                log.info("Found profile by email: id={}, email={}, role={}, enabled={}", 
                         profile.getId(), profile.getEmail(), profile.getRole(), profile.getEnabled());
                
                // Check if password is set
                if (profile.getPassword() == null || profile.getPassword().isEmpty()) {
                    log.error("Profile found but password is null or empty for email: {}", usernameOrEmail);
                    throw new UsernameNotFoundException("User found but has no password: " + usernameOrEmail);
                }
                
                // Log the password hash to help diagnose encoding issues
                log.debug("Password hash for user {}: {}", profile.getEmail(), 
                         profile.getPassword() != null ? profile.getPassword().substring(0, 10) + "..." : "null");
                
                UserDetailsImpl userDetails = UserDetailsImpl.build(profile);
                log.info("Built UserDetails from Profile: username={}, authorities={}, enabled={}", 
                         userDetails.getUsername(), userDetails.getAuthorities(), userDetails.isEnabled());
                
                return userDetails;
            }
            
            // If not found by email in profiles, log the failure
            log.warn("Profile not found with email: {}", usernameOrEmail);
            
            // Try to find user by username in User table as fallback
            log.info("Attempting fallback lookup in User table for username: {}", usernameOrEmail);
            
            // Log an error and throw exception
            log.error("User not found with email or username: {}", usernameOrEmail);
            throw new UsernameNotFoundException("User not found with email or username: " + usernameOrEmail);
        } catch (UsernameNotFoundException e) {
            log.error("Username not found exception: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error loading user: {}", e.getMessage(), e);
            throw new UsernameNotFoundException("Error loading user: " + e.getMessage(), e);
        }
    }
} 