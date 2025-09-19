package com.rpa.chamados.security;

import com.rpa.chamados.domain.model.enums.UserRole;
import com.rpa.chamados.security.annotations.RequiresRole;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Aspect
@Component
public class RoleAuthorizationAspect {

    private final UserRoleAuthorizationService authorizationService;

    public RoleAuthorizationAspect(UserRoleAuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @Before("@annotation(requiresRole)")
    public void checkRoleAuthorization(JoinPoint joinPoint, RequiresRole requiresRole) {
        UserRole[] requiredRoles = requiresRole.value();

        if (requiredRoles.length == 0) {
            log.warn("No roles specified in @RequiresRole annotation for method: {}",
                    joinPoint.getSignature().getName());
            return;
        }

        boolean hasAccess = authorizationService.hasAnyRole(requiredRoles);

        if (!hasAccess) {
            String userEmail = authorizationService.getCurrentUserEmail();
            UserRole currentRole = authorizationService.getCurrentUserRole();

            log.warn("Access denied for user {} with role {} to method {}. Required roles: {}",
                    userEmail, currentRole, joinPoint.getSignature().getName(), requiredRoles);

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Access denied. Required role(s): " + java.util.Arrays.toString(requiredRoles)
            );
        }

        log.debug("Access granted to method {} for user {}",
                joinPoint.getSignature().getName(), authorizationService.getCurrentUserEmail());
    }
}