package com.rpa.chamados.handlers;

import com.rpa.chamados.controller.dto.ErrorResponse;
import com.rpa.chamados.controller.dto.ValidationError;
import com.rpa.chamados.exception.DemandAlreadyExistsException;
import com.rpa.chamados.exception.DemandNotFoundException;
import com.rpa.chamados.exception.InvalidDemandUpdateException;
import com.rpa.chamados.exception.InvalidJwtTokenException;
import com.rpa.chamados.exception.InvalidProjectUpdateException;
import com.rpa.chamados.exception.InvalidTrackingCreationException;
import com.rpa.chamados.exception.InvalidTrackingUpdateException;
import com.rpa.chamados.exception.ProjectAlreadyExistsException;
import com.rpa.chamados.exception.ProjectNotFoundException;
import com.rpa.chamados.exception.TrackingNotFoundException;
import com.rpa.chamados.exception.UserAlreadyExistsException;
import com.rpa.chamados.exception.UserNotFoundException;
import com.rpa.chamados.exception.ClientNotFoundException;
import com.rpa.chamados.exception.ClientAlreadyExistsException;
import com.rpa.chamados.exception.InvalidClientUpdateException;
import com.rpa.chamados.exception.InsufficientRoleException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, 
            HttpServletRequest request) {
        
        List<ValidationError> validationErrors = new ArrayList<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            validationErrors.add(new ValidationError(
                error.getField(),
                error.getDefaultMessage(),
                error.getRejectedValue()
            ));
        });

        ex.getBindingResult().getGlobalErrors().forEach(error -> {
            validationErrors.add(new ValidationError(
                error.getObjectName(),
                error.getDefaultMessage(),
                null
            ));
        });

        ErrorResponse errorResponse = new ErrorResponse(
            "Dados de entrada inválidos",
            "VALIDATION_ERROR",
            request.getRequestURI(),
            validationErrors
        );

        logger.warn("Validation errors for request {}: {}", request.getRequestURI(), validationErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "USER_NOT_FOUND",
            request.getRequestURI()
        );

        logger.warn("UserNotFoundException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(
            UserAlreadyExistsException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "USER_ALREADY_EXISTS",
            request.getRequestURI()
        );

        logger.warn("UserAlreadyExistsException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "INVALID_ARGUMENT",
            request.getRequestURI()
        );

        logger.warn("IllegalArgumentException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            "Erro interno do servidor: " + ex.getMessage(),
            "INTERNAL_ERROR",
            request.getRequestURI()
        );

        logger.error("RuntimeException for request {}: ", request.getRequestURI(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            "Erro inesperado no servidor",
            "UNKNOWN_ERROR",
            request.getRequestURI()
        );

        logger.error("Unexpected exception for request {}: ", request.getRequestURI(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(InvalidJwtTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidJwtToken(
            InvalidJwtTokenException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                ex.getMessage(),
                "UNAUTHORIZED",
                request.getRequestURI()
        );

        logger.error("Unexpected exception for request {}: ", request.getRequestURI(), ex);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectNotFound(
            ProjectNotFoundException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "PROJECT_NOT_FOUND",
            request.getRequestURI()
        );

        logger.warn("ProjectNotFoundException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(ProjectAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleProjectAlreadyExists(
            ProjectAlreadyExistsException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "PROJECT_ALREADY_EXISTS",
            request.getRequestURI()
        );

        logger.warn("ProjectAlreadyExistsException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(InvalidProjectUpdateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidProjectUpdate(
            InvalidProjectUpdateException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "INVALID_PROJECT_UPDATE",
            request.getRequestURI()
        );

        logger.warn("InvalidProjectUpdateException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(DemandNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDemandNotFound(
            DemandNotFoundException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "DEMAND_NOT_FOUND",
            request.getRequestURI()
        );

        logger.warn("DemandNotFoundException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(DemandAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleDemandAlreadyExists(
            DemandAlreadyExistsException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "DEMAND_ALREADY_EXISTS",
            request.getRequestURI()
        );

        logger.warn("DemandAlreadyExistsException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(InvalidDemandUpdateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidDemandUpdate(
            InvalidDemandUpdateException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "INVALID_DEMAND_UPDATE",
            request.getRequestURI()
        );

        logger.warn("InvalidDemandUpdateException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(TrackingNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTrackingNotFound(
            TrackingNotFoundException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "TRACKING_NOT_FOUND",
            request.getRequestURI()
        );

        logger.warn("TrackingNotFoundException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(InvalidTrackingCreationException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTrackingCreation(
            InvalidTrackingCreationException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "INVALID_TRACKING_CREATION",
            request.getRequestURI()
        );

        logger.warn("InvalidTrackingCreationException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(InvalidTrackingUpdateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTrackingUpdate(
            InvalidTrackingUpdateException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "INVALID_TRACKING_UPDATE",
            request.getRequestURI()
        );

        logger.warn("InvalidTrackingUpdateException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(ClientNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleClientNotFound(
            ClientNotFoundException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "CLIENT_NOT_FOUND",
            request.getRequestURI()
        );

        logger.warn("ClientNotFoundException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(ClientAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleClientAlreadyExists(
            ClientAlreadyExistsException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "CLIENT_ALREADY_EXISTS",
            request.getRequestURI()
        );

        logger.warn("ClientAlreadyExistsException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(InvalidClientUpdateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidClientUpdate(
            InvalidClientUpdateException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "INVALID_CLIENT_UPDATE",
            request.getRequestURI()
        );

        logger.warn("InvalidClientUpdateException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(InsufficientRoleException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientRole(
            InsufficientRoleException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage(),
            "INSUFFICIENT_ROLE",
            request.getRequestURI()
        );

        logger.warn("InsufficientRoleException for request {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

}