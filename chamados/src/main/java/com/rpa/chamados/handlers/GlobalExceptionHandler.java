package com.rpa.chamados.handlers;

import com.rpa.chamados.controller.dto.ErrorResponse;
import com.rpa.chamados.controller.dto.ValidationError;
import com.rpa.chamados.exception.InvalidJwtTokenException;
import com.rpa.chamados.exception.UserAlreadyExistsException;
import com.rpa.chamados.exception.UserNotFoundException;
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

}