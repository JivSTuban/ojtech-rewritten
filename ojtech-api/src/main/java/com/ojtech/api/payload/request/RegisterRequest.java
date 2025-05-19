package com.ojtech.api.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
    
    // Constructors
    public RegisterRequest() {
    }

    public RegisterRequest(String fullName, String email, String password, String confirmPassword, String role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.role = role;
    }

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

    // Setters
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RegisterRequest that = (RegisterRequest) o;
        return java.util.Objects.equals(fullName, that.fullName) &&
               java.util.Objects.equals(email, that.email) &&
               java.util.Objects.equals(password, that.password) &&
               java.util.Objects.equals(confirmPassword, that.confirmPassword) &&
               java.util.Objects.equals(role, that.role);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(fullName, email, password, confirmPassword, role);
    }

    @Override
    public String toString() {
        return "RegisterRequest{" +
               "fullName='" + fullName + '\'' +
               ", email='" + email + '\'' +
               // Do not include password or confirmPassword in toString for security
               ", role='" + role + '\'' +
               '}';
    }
} 