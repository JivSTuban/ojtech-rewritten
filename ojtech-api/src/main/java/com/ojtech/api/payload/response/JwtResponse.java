package com.ojtech.api.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private List<String> roles;
    
    public JwtResponse(String token, UUID id, String email, String fullName, String role, List<String> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.roles = roles;
    }
} 