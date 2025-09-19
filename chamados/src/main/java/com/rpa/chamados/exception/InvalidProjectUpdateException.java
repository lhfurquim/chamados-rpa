package com.rpa.chamados.exception;

public class InvalidProjectUpdateException extends RuntimeException {
    public InvalidProjectUpdateException(String message) {
        super(message);
    }
}