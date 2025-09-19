package com.rpa.chamados.exception;

public class InvalidTrackingUpdateException extends RuntimeException {
    public InvalidTrackingUpdateException(String message) {
        super(message);
    }
}