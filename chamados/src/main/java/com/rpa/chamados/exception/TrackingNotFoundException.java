package com.rpa.chamados.exception;

public class TrackingNotFoundException extends RuntimeException {
    public TrackingNotFoundException(String message) {
        super(message);
    }
}