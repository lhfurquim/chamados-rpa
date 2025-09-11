package com.rpa.chamados.exception;

public class RobotNotFoundException extends RuntimeException {
    public RobotNotFoundException(String message) {
        super(message);
    }
}
