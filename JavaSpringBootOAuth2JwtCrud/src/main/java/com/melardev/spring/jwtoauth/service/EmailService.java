package com.melardev.spring.jwtoauth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    public void sendVerificationEmail(String toEmail, String userId) throws MessagingException {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "OJTech");
            helper.setTo(toEmail);
            helper.setSubject("Welcome to OJTech!");

            String verificationUrl = baseUrl + "/api/auth/verifyEmail/" + userId;
            String emailContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
                        <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Email Icon -->
                            <div style="background-color:rgb(0, 0, 0); width: 64px; height: 64px; border-radius: 50%%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <img src="https://res.cloudinary.com/df7wrezta/image/upload/v1748160270/dbe6m8ajpudgn6veyopz.png" style="width: 64px; height: 64px;"/>
                            </div>
                            
                            <h2 style="color: #333333; margin: 0 0 10px; font-size: 24px;">Welcome to OJTech!</h2>
                            <p style="color: #666666; margin: 0 0 5px; font-size: 14px;">🔒 Secure Email Verification</p>
                            
                            <p style="color: #666666; margin: 24px 0; font-size: 14px; line-height: 1.5;">
                              
                                Please click the button below to verify your account<br/>
                                and get started.
                            </p>
                            
                            <a href="%s" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500; margin: 20px 0;">
                                <span style="display: inline-flex; align-items: center;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    Verify Email Address
                                </span>
                            </a>
                            
                            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee;">
                                <p style="color: #666666; font-size: 13px; margin: 0 0 8px;">Didn't create an account?</p>
                                <p style="color: #666666; font-size: 13px; margin: 0;">You can safely ignore this email. No account will be created.</p>
                            </div>
                            
                            <div style="margin-top: 32px; color: #999999; font-size: 12px;">
                                <p style="margin: 0 0 8px;">This is an automated message. Please do not reply to this email.</p>
                                <p style="margin: 0; color: #999999;">Powered by <span style="color: #666666;">OJTech</span></p>
                            </div>
                        </div>
                    </body>
                </html>
                """, verificationUrl);

            helper.setText(emailContent, true);
            emailSender.send(message);
            System.out.println("Verification email sent successfully to: " + toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send verification email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            throw new MessagingException("Failed to send verification email: " + e.getMessage());
        }
    }
} 