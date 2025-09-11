package com.rpa.chamados.service;

import com.rpa.chamados.controller.dto.SubmitterInfoDto;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthenticationService {
    
    SubmitterInfoDto getCurrentUser(HttpServletRequest request);
    
    SubmitterInfoDto validateTokenAndGetUser(String token);
    
    SubmitterInfoDto ensureUserExists(String token);
    
    String extractEmailFromToken(String token);
    
    String extractNameFromToken(String token);
    
    boolean isValidToken(String token);
}