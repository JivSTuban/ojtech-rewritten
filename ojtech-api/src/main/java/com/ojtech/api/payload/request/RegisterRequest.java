package com.ojtech.api.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
    private String password;
    
    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
    
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "STUDENT|EMPLOYER|ADMIN", message = "Role must be either STUDENT, EMPLOYER, or ADMIN")
    private String role;
    
    // Explicit getters in case Lombok fails
    public String getFullName() {
        return fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
    
    public String getRole() {
        return role;
    }
} 