package com.melardev.spring.jwtoauth.config;

import com.melardev.spring.jwtoauth.security.CurrentUser;
import com.melardev.spring.jwtoauth.security.UserPrincipal;
import com.melardev.spring.jwtoauth.security.services.UserDetailsImpl;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new CurrentUserArgumentResolver());
    }

    private static class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

        @Override
        public boolean supportsParameter(MethodParameter parameter) {
            return parameter.getParameterAnnotation(CurrentUser.class) != null &&
                   parameter.getParameterType().equals(UserPrincipal.class);
        }

        @Override
        public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                     NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return null;
            }
            
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof UserPrincipal) {
                return principal;
            } else if (principal instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) principal;
                // Convert UserDetailsImpl to UserPrincipal
                return new UserPrincipal(
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    userDetails.getPassword(),
                    userDetails.getAuthorities()
                );
            }
            
            return null;
        }
    }
} 