package com.rpa.chamados.exception;

import com.rpa.chamados.domain.model.enums.UserRole;

public class InsufficientRoleException extends RuntimeException {

    public InsufficientRoleException(UserRole currentRole, UserRole[] requiredRoles) {
        super(String.format("Access denied. Current role: %s. Required role(s): %s",
                currentRole != null ? currentRole.name() : "NONE",
                java.util.Arrays.toString(requiredRoles)));
    }

    public InsufficientRoleException(String message) {
        super(message);
    }
}