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

    @Value("${backend.base-url}")
    private String baseURL;
    public void sendVerificationEmail(String toEmail, String userId) throws MessagingException {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "OJTech Team");
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email Address");
           

         

            String verificationUrl =  baseURL+"/api/auth/verifyEmail/" + userId;
            String emailContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333333; margin-bottom: 20px;">Welcome to OJTech!</h2>
                            <p style="color: #666666; margin-bottom: 20px;">Please click the button below to verify your email address:</p>
                            <div style="text-align: center; margin-bottom: 20px;">
                                <a href="%s" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
                            </div>
                            <p style="color: #666666; font-size: 12px;">If you did not create an account, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                            <p style="color: #999999; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
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