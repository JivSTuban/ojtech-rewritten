package com.ojtech.api.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ojtech.api.model.Profile;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class UserDetailsImpl implements UserDetails {

    private UUID id;
    private String email;
    
    @JsonIgnore
    private String password;
    
    private String fullName;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean enabled;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    
    @JsonIgnore
    private Profile profile;
    
    public UserDetailsImpl() {
    }
    
    public UserDetailsImpl(UUID id, String email, String password, String fullName, 
                         Collection<? extends GrantedAuthority> authorities, boolean enabled, 
                         boolean accountNonExpired, boolean accountNonLocked, boolean credentialsNonExpired, 
                         Profile profile) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.authorities = authorities;
        this.enabled = enabled;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
        this.profile = profile;
    }

    public static UserDetailsImpl build(Profile profile) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + profile.getRole().name())
        );

        return UserDetailsImpl.builder()
                .id(profile.getId())
                .email(profile.getEmail())
                .password(profile.getPassword())
                .fullName(profile.getFullName())
                .authorities(authorities)
                .enabled(profile.getEnabled() != null ? profile.getEnabled() : true)
                .accountNonExpired(profile.getAccountNonExpired() != null ? profile.getAccountNonExpired() : true)
                .accountNonLocked(profile.getAccountNonLocked() != null ? profile.getAccountNonLocked() : true)
                .credentialsNonExpired(profile.getCredentialsNonExpired() != null ? profile.getCredentialsNonExpired() : true)
                .profile(profile)
                .build();
    }
    
    // Explicit builder static class in case Lombok fails
    public static UserDetailsImplBuilder builder() {
        return new UserDetailsImplBuilder();
    }
    
    public static class UserDetailsImplBuilder {
        private UUID id;
        private String email;
        private String password;
        private String fullName;
        private Collection<? extends GrantedAuthority> authorities;
        private boolean enabled;
        private boolean accountNonExpired;
        private boolean accountNonLocked;
        private boolean credentialsNonExpired;
        private Profile profile;
        
        UserDetailsImplBuilder() {}
        
        public UserDetailsImplBuilder id(UUID id) {
            this.id = id;
            return this;
        }
        
        public UserDetailsImplBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public UserDetailsImplBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public UserDetailsImplBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }
        
        public UserDetailsImplBuilder authorities(Collection<? extends GrantedAuthority> authorities) {
            this.authorities = authorities;
            return this;
        }
        
        public UserDetailsImplBuilder enabled(boolean enabled) {
            this.enabled = enabled;
            return this;
        }
        
        public UserDetailsImplBuilder accountNonExpired(boolean accountNonExpired) {
            this.accountNonExpired = accountNonExpired;
            return this;
        }
        
        public UserDetailsImplBuilder accountNonLocked(boolean accountNonLocked) {
            this.accountNonLocked = accountNonLocked;
            return this;
        }
        
        public UserDetailsImplBuilder credentialsNonExpired(boolean credentialsNonExpired) {
            this.credentialsNonExpired = credentialsNonExpired;
            return this;
        }
        
        public UserDetailsImplBuilder profile(Profile profile) {
            this.profile = profile;
            return this;
        }
        
        public UserDetailsImpl build() {
            return new UserDetailsImpl(id, email, password, fullName, authorities, 
                                    enabled, accountNonExpired, accountNonLocked, 
                                    credentialsNonExpired, profile);
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    /**
     * Gets the user's role without the "ROLE_" prefix
     * @return The user role as a string
     */
    public String getRole() {
        if (authorities == null || authorities.isEmpty()) {
            return null;
        }
        
        // Get the first authority, which should be the role
        String authority = authorities.iterator().next().getAuthority();
        
        // Remove "ROLE_" prefix if present
        return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
    }
    
    // Explicit getters in case Lombok fails
    public UUID getId() {
        return id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public Profile getProfile() {
        return profile;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public void setAuthorities(Collection<? extends GrantedAuthority> authorities) {
        this.authorities = authorities;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public void setAccountNonExpired(boolean accountNonExpired) {
        this.accountNonExpired = accountNonExpired;
    }
    
    public void setAccountNonLocked(boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }
    
    public void setCredentialsNonExpired(boolean credentialsNonExpired) {
        this.credentialsNonExpired = credentialsNonExpired;
    }
    
    public void setProfile(Profile profile) {
        this.profile = profile;
    }
} 