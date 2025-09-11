package com.rpa.chamados.service.impl;

import com.rpa.chamados.controller.dto.SubmitterInfoDto;
import com.rpa.chamados.security.JwtTokenService;
import com.rpa.chamados.service.AuthenticationService;
import com.rpa.chamados.service.UserService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private final JwtTokenService jwtTokenService;
    private final UserService userService;

    public AuthenticationServiceImpl(JwtTokenService jwtTokenService, UserService userService) {
        this.jwtTokenService = jwtTokenService;
        this.userService = userService;
    }

    @Override
    public SubmitterInfoDto getCurrentUser(HttpServletRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("No authenticated user found in security context");
                return null;
            }
            
            String userEmail = (String) request.getAttribute("user.email");
            
            if (userEmail != null) {
                log.debug("Retrieving user from database: {}", userEmail);
                
                try {
                    SubmitterInfoDto user = userService.getFormRespondentByEmail(userEmail);
                    log.debug("Successfully retrieved user from database: {}", userEmail);
                    return user;
                } catch (Exception e) {
                    log.error("User not found in database for email: {}", userEmail);
                    return null;
                }
            } else {
                log.warn("User email not found in request attributes after JWT validation");
                return null;
            }
            
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public SubmitterInfoDto validateTokenAndGetUser(String token) {
        try {
            if (!isValidToken(token)) {
                throw new JwtException("Invalid token");
            }

            String email = extractEmailFromToken(token);
            if (email == null || email.trim().isEmpty()) {
                throw new JwtException("Token does not contain valid email");
            }

            try {
                SubmitterInfoDto user = userService.getFormRespondentByEmail(email);
                log.debug("Successfully retrieved user from database: {}", email);
                return user;
            } catch (Exception e) {
                log.error("User not found in database for email: {}", email);
                throw new JwtException("User not found in system: " + email, e);
            }

        } catch (JwtException e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during token validation: {}", e.getMessage());
            throw new JwtException("Token validation error", e);
        }
    }

    @Override
    public SubmitterInfoDto ensureUserExists(String token) {
        try {
            if (!isValidToken(token)) {
                throw new JwtException("Invalid token");
            }

            String email = extractEmailFromToken(token);
            if (email == null || email.trim().isEmpty()) {
                throw new JwtException("Token does not contain valid email");
            }

            try {
                SubmitterInfoDto existingUser = userService.getFormRespondentByEmail(email);
                log.debug("User found in database: {}", email);
                return existingUser;
            } catch (Exception e) {
                log.debug("User not found in database, will create new user: {}", email);
            }

            String name = extractNameFromToken(token);
            String subject = jwtTokenService.extractSubjectFromToken(token);
            
            SubmitterInfoDto newUserData = new SubmitterInfoDto(
                subject,
                name != null ? name : email,
                email,
                null,
                "Não informado",
                "Torre RPA",
                "Usuário",
                true,
                0,
                null,
                null
            );

            SubmitterInfoDto createdUser = userService.findOrCreateSubmitter(newUserData);
            log.info("Successfully created new user: {}", email);
            return createdUser;
            
        } catch (JwtException e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw new RuntimeException("Could not validate token", e);
        } catch (Exception e) {
            log.error("Failed to ensure user exists for token: {}", e.getMessage());
            throw new RuntimeException("Could not validate user from token", e);
        }
    }

    @Override
    public String extractEmailFromToken(String token) {
        try {
            return jwtTokenService.extractEmailFromToken(token);
        } catch (Exception e) {
            log.error("Failed to extract email from token: {}", e.getMessage());
            throw new JwtException("Could not extract email from token", e);
        }
    }

    @Override
    public String extractNameFromToken(String token) {
        try {
            return jwtTokenService.extractNameFromToken(token);
        } catch (Exception e) {
            log.warn("Failed to extract name from token: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean isValidToken(String token) {
        try {
            jwtTokenService.validateToken(token);
            return true;
        } catch (JwtException e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Unexpected error during token validation: {}", e.getMessage());
            return false;
        }
    }
}