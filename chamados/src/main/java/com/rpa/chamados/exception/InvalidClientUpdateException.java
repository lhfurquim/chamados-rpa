package com.rpa.chamados.exception;

public class InvalidClientUpdateException extends RuntimeException {
    public InvalidClientUpdateException(String message) {
        super(message);
    }
}