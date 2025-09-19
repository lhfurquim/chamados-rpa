package com.rpa.chamados.exception;

public class DemandNotFoundException extends RuntimeException {
    public DemandNotFoundException(String message) {
        super(message);
    }
}