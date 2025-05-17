package com.ojtech.api.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    // Explicit getters in case Lombok fails
    public String getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
} 