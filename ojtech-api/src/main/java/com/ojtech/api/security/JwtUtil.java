package com.ojtech.api.security;

import com.ojtech.api.model.Profile;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.Base64;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    // Use a SecretKey instead of a String for better security
    private final SecretKey key;
    
    @Value("${jwt.expirationMs}")
    private Long expiration;

    // Constructor to initialize the key
    public JwtUtil(@Value("${jwt.secret}") String secretKey) {
        // Generate a secure key for HS512 algorithm
        // Always use the provided secret key for consistency
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        if (userDetails instanceof UserDetailsImpl) {
            UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
            Profile profile = userDetailsImpl.getProfile();
            if (profile != null) {
                claims.put("userId", profile.getId().toString());
                claims.put("role", profile.getRole().toString());
                claims.put("fullName", profile.getFullName());
                log.debug("Adding claims for profile: Email={}, ID={}, Role={}", profile.getEmail(), profile.getId(), profile.getRole());
            } else {
                log.warn("Profile is null for user: {}", userDetails.getUsername());
            }
        } else {
            log.warn("UserDetails is not an instance of UserDetailsImpl for user: {}", userDetails.getUsername());
        }
        
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration * 1000);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean isValid = (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        return isValid;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    /**
     * Utility method to dump all claims from a token for debugging
     */
    public String dumpAllClaims(String token) {
        try {
            Claims claims = extractAllClaims(token);
            StringBuilder sb = new StringBuilder();
            sb.append("Subject: ").append(claims.getSubject()).append(", ");
            sb.append("UserId: ").append(claims.get("userId")).append(", ");
            sb.append("Role: ").append(claims.get("role")).append(", ");
            sb.append("FullName: ").append(claims.get("fullName")).append(", ");
            sb.append("IssuedAt: ").append(claims.getIssuedAt()).append(", ");
            sb.append("Expiration: ").append(claims.getExpiration());
            return sb.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
} 