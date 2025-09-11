package com.rpa.chamados.security;

import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class AzureAdKeyService {
    
    @Value("${azure.ad.tenant-id}")
    private String tenantId;
    
    private static final String AZURE_AD_JWKS_URL_TEMPLATE = "https://login.microsoftonline.com/%s/discovery/v2.0/keys";
    private static final String AZURE_AD_COMMON_JWKS_URL = "https://login.microsoftonline.com/common/discovery/v2.0/keys";
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, RSAPublicKey> keyCache = new ConcurrentHashMap<>();
    private long lastKeyFetch = 0;
    private static final long KEY_CACHE_TTL = 3600000; // 1 hour


    public Algorithm getAlgorithmForKeyId(String keyId) {
        try {
            RSAPublicKey publicKey = getPublicKey(keyId);
            if (publicKey == null) {
                throw new RuntimeException("Public key not found for key ID: " + keyId);
            }
            return Algorithm.RSA256(publicKey, null);
        } catch (Exception e) {
            log.error("Failed to create algorithm for key ID {}: {}", keyId, e.getMessage());
            throw new RuntimeException("Failed to create JWT verification algorithm", e);
        }
    }

    private RSAPublicKey getPublicKey(String keyId) {
        if (keyCache.containsKey(keyId) && !isCacheExpired()) {
            return keyCache.get(keyId);
        }
        
        if (isCacheExpired() || !keyCache.containsKey(keyId)) {
            refreshKeys();
        }
        
        return keyCache.get(keyId);
    }

    private void refreshKeys() {
        try {
            log.debug("Refreshing Azure AD public keys");
            
            String jwksUrl = String.format(AZURE_AD_JWKS_URL_TEMPLATE, tenantId);
            JsonNode jwksResponse = fetchJwks(jwksUrl);
            
            if (jwksResponse == null) {
                log.warn("Failed to fetch from tenant-specific endpoint, trying common endpoint");
                jwksResponse = fetchJwks(AZURE_AD_COMMON_JWKS_URL);
            }
            
            if (jwksResponse != null) {
                parseAndCacheKeys(jwksResponse);
                lastKeyFetch = System.currentTimeMillis();
                log.info("Successfully refreshed {} Azure AD public keys", keyCache.size());
            } else {
                log.error("Failed to fetch Azure AD public keys from any endpoint");
            }
            
        } catch (Exception e) {
            log.error("Error refreshing Azure AD public keys: {}", e.getMessage());
        }
    }
    
    private JsonNode fetchJwks(String url) {
        try {
            String response = restTemplate.getForObject(url, String.class);
            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.warn("Failed to fetch JWKS from {}: {}", url, e.getMessage());
            return null;
        }
    }
    
    private void parseAndCacheKeys(JsonNode jwksResponse) {
        try {
            JsonNode keys = jwksResponse.get("keys");
            if (keys == null || !keys.isArray()) {
                log.warn("Invalid JWKS response format - no keys array found");
                return;
            }
            
            Map<String, RSAPublicKey> newKeys = new HashMap<>();
            
            for (JsonNode key : keys) {
                try {
                    String keyId = key.get("kid").asText();
                    String keyType = key.get("kty").asText();
                    String algorithm = key.get("alg").asText();
                    String use = key.has("use") ? key.get("use").asText() : null;
                    
                    if (!"RSA".equals(keyType) || (use != null && !"sig".equals(use))) {
                        continue;
                    }
                    
                    String nValue = key.get("n").asText();
                    String eValue = key.get("e").asText();
                    
                    RSAPublicKey publicKey = createRSAPublicKey(nValue, eValue);
                    newKeys.put(keyId, publicKey);
                    
                    log.debug("Cached public key: keyId={}, algorithm={}", keyId, algorithm);
                    
                } catch (Exception e) {
                    log.warn("Failed to parse key from JWKS: {}", e.getMessage());
                }
            }
            
            keyCache.clear();
            keyCache.putAll(newKeys);
            
        } catch (Exception e) {
            log.error("Error parsing JWKS response: {}", e.getMessage());
        }
    }
    
    private RSAPublicKey createRSAPublicKey(String nValue, String eValue) throws Exception {
        byte[] nBytes = Base64.getUrlDecoder().decode(nValue);
        byte[] eBytes = Base64.getUrlDecoder().decode(eValue);
        
        BigInteger modulus = new BigInteger(1, nBytes);
        BigInteger exponent = new BigInteger(1, eBytes);
        
        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        
        return (RSAPublicKey) factory.generatePublic(spec);
    }
    
    private boolean isCacheExpired() {
        return System.currentTimeMillis() - lastKeyFetch > KEY_CACHE_TTL;
    }

}