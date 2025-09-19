package com.rpa.chamados.exception;

public class DemandAlreadyExistsException extends RuntimeException {
    public DemandAlreadyExistsException(String message) {
        super(message);
    }
}