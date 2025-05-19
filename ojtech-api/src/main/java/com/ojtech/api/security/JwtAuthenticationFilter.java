package com.ojtech.api.security;

import com.ojtech.api.security.jwt.JwtUtils;
import com.ojtech.api.security.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String requestURI = request.getRequestURI();
        log.debug("JwtAuthenticationFilter: Processing request for URI: {}", requestURI);
        
        try {
            String jwt = parseJwt(request);
            
            // Special handling for /api/profile/me endpoint
            boolean isProfileMeEndpoint = requestURI.equals("/api/profile/me");
            if (isProfileMeEndpoint) {
                log.debug("JwtAuthenticationFilter: Special handling for /api/profile/me endpoint");
            }
            
            if (jwt != null) {
                String username = jwtUtils.extractUsername(jwt);
                log.debug("JwtAuthenticationFilter: JWT token found for user: {}", username);

                // Dump the token claims for debugging
                log.debug("JwtAuthenticationFilter: Token claims: {}", jwtUtils.dumpAllClaims(jwt));

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        log.debug("JwtAuthenticationFilter: User details loaded successfully for: {}", username);
                        log.debug("JwtAuthenticationFilter: User authorities: {}", userDetails.getAuthorities());
                        
                        if (jwtUtils.validateToken(jwt, userDetails)) {
                            log.debug("JwtAuthenticationFilter: JWT token valid for user: {}", username);
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                            
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            
                            // Verify authentication is set correctly
                            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                            if (auth != null) {
                                log.debug("JwtAuthenticationFilter: Authentication set in SecurityContext. User: {}, Authorities: {}", 
                                          auth.getName(), auth.getAuthorities());
                            } else {
                                log.warn("JwtAuthenticationFilter: Failed to set authentication in SecurityContext");
                            }
                        } else {
                            log.warn("JwtAuthenticationFilter: JWT token validation failed for user: {}", username);
                        }
                    } catch (UsernameNotFoundException e) {
                        log.error("JwtAuthenticationFilter: User not found: {}", username, e);
                    } catch (Exception e) {
                        log.error("JwtAuthenticationFilter: Error loading user details: {}", e.getMessage(), e);
                    }
                } else {
                    if (username == null) {
                        log.warn("JwtAuthenticationFilter: Username is null in JWT token");
                    } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
                        log.debug("JwtAuthenticationFilter: Authentication already set in SecurityContext");
                    }
                }
            } else {
                log.debug("JwtAuthenticationFilter: No JWT token found in request: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("JwtAuthenticationFilter: Cannot set user authentication: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
        
        // Log after the request is processed
        log.debug("JwtAuthenticationFilter: Request processed for URI: {}", request.getRequestURI());
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            log.debug("JwtAuthenticationFilter: Authentication after processing: {}, Authorities: {}", 
                     auth.getName(), auth.getAuthorities());
        } else {
            log.debug("JwtAuthenticationFilter: No authentication in SecurityContext after processing");
        }
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        log.debug("JwtAuthenticationFilter: Authorization header: {}", headerAuth != null ? 
                  (headerAuth.length() > 20 ? headerAuth.substring(0, 20) + "..." : headerAuth) : "null");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            log.debug("JwtAuthenticationFilter: Token extracted from header: {}", 
                     token.length() > 20 ? token.substring(0, 20) + "..." : token);
            return token;
        }

        return null;
    }
} 