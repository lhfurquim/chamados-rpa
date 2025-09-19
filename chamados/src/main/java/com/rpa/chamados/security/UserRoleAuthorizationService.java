package com.rpa.chamados.security;

import com.rpa.chamados.domain.model.User;
import com.rpa.chamados.domain.model.enums.UserRole;
import com.rpa.chamados.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Slf4j
@Service
public class UserRoleAuthorizationService {

    private final UserRepository userRepository;

    public UserRoleAuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean hasAnyRole(UserRole... requiredRoles) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("No authentication found in security context");
                return false;
            }

            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);

            if (userOpt.isEmpty()) {
                log.warn("User not found with email: {}", userEmail);
                return false;
            }

            User user = userOpt.get();
            UserRole userRole = user.getUserRole();

            if (userRole == null) {
                log.warn("User {} has no role assigned", userEmail);
                return false;
            }

            boolean hasRole = Arrays.asList(requiredRoles).contains(userRole);
            log.debug("User {} with role {} access check: {} (required: {})",
                    userEmail, userRole, hasRole, Arrays.toString(requiredRoles));

            return hasRole;

        } catch (Exception e) {
            log.error("Error checking user role authorization: {}", e.getMessage());
            return false;
        }
    }

    public UserRole getCurrentUserRole() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }

            String userEmail = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(userEmail);

            return userOpt.map(User::getUserRole).orElse(null);

        } catch (Exception e) {
            log.error("Error getting current user role: {}", e.getMessage());
            return null;
        }
    }

    public String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            return authentication != null ? authentication.getName() : null;
        } catch (Exception e) {
            log.error("Error getting current user email: {}", e.getMessage());
            return null;
        }
    }
}