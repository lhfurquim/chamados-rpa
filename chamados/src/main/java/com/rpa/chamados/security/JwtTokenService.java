package com.rpa.chamados.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
public class JwtTokenService {
    
    @Value("${azure.ad.tenant-id}")
    private String tenantId;
    
    @Value("${azure.ad.client-id}")
    private String clientId;
    
    @Value("${azure.ad.enable-signature-verification:false}")
    private boolean enableSignatureVerification;
    
    private final AzureAdKeyService azureAdKeyService;
    
    public JwtTokenService(AzureAdKeyService azureAdKeyService) {
        this.azureAdKeyService = azureAdKeyService;
    }
    
    private static final String AZURE_AD_ISSUER_PREFIX = "https://login.microsoftonline.com/";
    private static final String AZURE_AD_ISSUER_V1_SUFFIX = "/";
    private static final String AZURE_AD_ISSUER_V2_SUFFIX = "/v2.0";
    
    public DecodedJWT validateToken(String token) {
        try {
          if (token.startsWith("Bearer ")) {
                token = token.substring(7);
          }
            
          log.debug("Validating JWT token (signature verification: {})", enableSignatureVerification);

          DecodedJWT jwt = enableSignatureVerification
                ? verifyAndDecode(token)
                : decodeWithoutVerification(token);
            
            validateTokenClaims(jwt);
            
            String email = extractEmailFromJWT(jwt);
            log.debug("JWT token validation successful for user: {}", email);
            
            return jwt;
            
        } catch (JWTVerificationException e) {
            log.error("JWT verification failed: {}", e.getMessage());
            throw new JwtException("Invalid JWT token: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error validating JWT token: {}", e.getMessage());
            throw new JwtException("Token validation error: " + e.getMessage(), e);
        }
    }

    private DecodedJWT decodeWithoutVerification(String token) {
        try {
            return JWT.decode(token);
        } catch (Exception e) {
            log.error("Failed to decode JWT token: {}", e.getMessage());
            throw new JWTVerificationException("Invalid JWT token format", e);
        }
    }

    private DecodedJWT verifyAndDecode(String token) {
        try {
            DecodedJWT unverifiedJwt = JWT.decode(token);
            String keyId = unverifiedJwt.getKeyId();
            
            if (keyId == null || keyId.trim().isEmpty()) {
                throw new JWTVerificationException("JWT token missing key ID (kid) in header");
            }
            
            Algorithm algorithm = azureAdKeyService.getAlgorithmForKeyId(keyId);
            
            JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(getExpectedIssuerV1(), getExpectedIssuerV2()) // Support both v1 and v2
                .withAudience(clientId)
                .acceptLeeway(60) // Accept 60 seconds clock skew for exp, nbf, iat
                .build();
            
            return verifier.verify(token);
            
        } catch (JWTVerificationException e) {
            log.error("JWT signature verification failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during JWT verification: {}", e.getMessage());
            throw new JWTVerificationException("JWT verification failed", e);
        }
    }
    
    private void validateTokenClaims(DecodedJWT jwt) {
        Date expiration = jwt.getExpiresAt();
        if (expiration != null && expiration.before(new Date())) {
            throw new JWTVerificationException("Token expired at: " + expiration);
        }
        
        Date notBefore = jwt.getNotBefore();
        if (notBefore != null && notBefore.after(new Date())) {
            throw new JWTVerificationException("Token not valid until: " + notBefore);
        }
        
        String issuer = jwt.getIssuer();
        if (issuer != null) {
            String expectedIssuerV1 = AZURE_AD_ISSUER_PREFIX + tenantId + AZURE_AD_ISSUER_V1_SUFFIX;
            String expectedIssuerV2 = AZURE_AD_ISSUER_PREFIX + tenantId + AZURE_AD_ISSUER_V2_SUFFIX;
            
            if (!issuer.equals(expectedIssuerV1) && !issuer.equals(expectedIssuerV2)) {
                log.warn("Unexpected issuer: {}. Expected: {} or {}", issuer, expectedIssuerV1, expectedIssuerV2);
            }
        }
        
        if (jwt.getAudience() != null && !jwt.getAudience().isEmpty()) {
            boolean validAudience = jwt.getAudience().contains(clientId);
            if (!validAudience) {
                log.warn("Token audience {} does not contain expected client ID {}", jwt.getAudience(), clientId);
            }
        }
        
        if (jwt.getSubject() == null || jwt.getSubject().trim().isEmpty()) {
            throw new JWTVerificationException("Token missing subject claim");
        }
        
        log.debug("Token claims validation successful for subject: {}", jwt.getSubject());
    }
    
    private String getExpectedIssuerV1() {
        return AZURE_AD_ISSUER_PREFIX + tenantId + AZURE_AD_ISSUER_V1_SUFFIX;
    }
    
    private String getExpectedIssuerV2() {
        return AZURE_AD_ISSUER_PREFIX + tenantId + AZURE_AD_ISSUER_V2_SUFFIX;
    }
    
    public String extractEmailFromToken(String token) {
        try {
            DecodedJWT jwt = validateToken(token);
            return extractEmailFromJWT(jwt);
        } catch (Exception e) {
            log.error("Error extracting email from token: {}", e.getMessage());
            throw new JwtException("Could not extract email from token", e);
        }
    }
    
    private String extractEmailFromJWT(DecodedJWT jwt) {
        Claim emailClaim = jwt.getClaim("email");
        if (!emailClaim.isNull()) {
            String email = emailClaim.asString();
            if (email != null && !email.trim().isEmpty()) {
                return email;
            }
        }
        
        Claim uniqueNameClaim = jwt.getClaim("unique_name");
        if (!uniqueNameClaim.isNull()) {
            String uniqueName = uniqueNameClaim.asString();
            if (uniqueName != null && !uniqueName.trim().isEmpty()) {
                return uniqueName;
            }
        }
        
        throw new JwtException("No email or unique_name claim found in token");
    }
    
    public String extractNameFromToken(String token) {
        try {
            DecodedJWT jwt = validateToken(token);
            return extractNameFromJWT(jwt);
        } catch (Exception e) {
            log.error("Error extracting name from token: {}", e.getMessage());
            return null; // Name is optional, return null instead of throwing
        }
    }
    
    private String extractNameFromJWT(DecodedJWT jwt) {
        Claim nameClaim = jwt.getClaim("name");
        if (!nameClaim.isNull()) {
            String name = nameClaim.asString();
            if (name != null && !name.trim().isEmpty()) {
                return name;
            }
        }
        
        Claim givenNameClaim = jwt.getClaim("given_name");
        Claim familyNameClaim = jwt.getClaim("family_name");
        
        if (!givenNameClaim.isNull() || !familyNameClaim.isNull()) {
            String givenName = !givenNameClaim.isNull() ? givenNameClaim.asString() : "";
            String familyName = !familyNameClaim.isNull() ? familyNameClaim.asString() : "";
            String fullName = (givenName + " " + familyName).trim();
            if (!fullName.isEmpty()) {
                return fullName;
            }
        }
        
        return null;
    }
    
    public String extractSubjectFromToken(String token) {
        try {
            DecodedJWT jwt = validateToken(token);
            return jwt.getSubject();
        } catch (Exception e) {
            log.error("Error extracting subject from token: {}", e.getMessage());
            throw new JwtException("Could not extract subject from token", e);
        }
    }
}