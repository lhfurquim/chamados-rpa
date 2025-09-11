package com.rpa.chamados.handlers;

import com.rpa.chamados.controller.dto.ErrorResponse;
import com.rpa.chamados.exception.RobotNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class RobotExceptionHandler {

    @ExceptionHandler(RobotNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                "Robô não encontrado",
                "NOT_FOUND_ERROR",
                request.getRequestURI(),
                List.of()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

}
