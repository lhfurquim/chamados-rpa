package com.rpa.chamados.security;

import com.rpa.chamados.domain.model.User;
import com.rpa.chamados.domain.model.enums.UserRole;
import com.rpa.chamados.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    @Value("${app.admin.special-email:lhfurquim@stefanini.com}")
    private String specialAdminEmail;

    @Value("${app.admin.auto-grant.enabled:true}")
    private boolean adminAutoGrantEnabled;

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService, UserRepository userRepository) {
        this.jwtTokenService = jwtTokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    String email = jwtTokenService.extractEmailFromToken(jwt);
                    String name = jwtTokenService.extractNameFromToken(jwt);
                    String subject = jwtTokenService.extractSubjectFromToken(jwt);
                    
                    if (email != null) {
                        List<SimpleGrantedAuthority> authorities = buildUserAuthorities(email);

                        UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                authorities
                            );

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        request.setAttribute("user.email", email);
                        request.setAttribute("user.name", name);
                        request.setAttribute("user.subject", subject);

                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        log.debug("JWT authentication successful for user: {} with authorities: {}", email, authorities);
                    }
                } catch (Exception e) {
                    log.error("Cannot set user authentication from JWT token: {}", e.getMessage());
                    SecurityContextHolder.clearContext();
                }
            }
        } catch (Exception e) {
            log.error("JWT authentication filter error: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }

    private List<SimpleGrantedAuthority> buildUserAuthorities(String email) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        // PRIORIDADE: Verificação especial para email admin
        if (adminAutoGrantEnabled && specialAdminEmail != null &&
            specialAdminEmail.equalsIgnoreCase(email)) {

            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            log.info("🔐 Auto-granted ADMIN role for special email: {}", email);

            // Garantir sincronização com banco de dados
            ensureAdminUserInDatabase(email);
            return authorities;
        }

        // Fluxo normal para outros emails
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                UserRole userRole = user.getUserRole();

                if (userRole != null) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + userRole.name()));
                    log.debug("Added role {} for user {}", userRole, email);
                } else {
                    log.warn("User {} has no role assigned, defaulting to DEFAULT", email);
                    authorities.add(new SimpleGrantedAuthority("ROLE_DEFAULT"));
                }
            } else {
                log.warn("User {} not found in database, defaulting to DEFAULT role", email);
                authorities.add(new SimpleGrantedAuthority("ROLE_DEFAULT"));
            }
        } catch (Exception e) {
            log.error("Error loading user role for {}: {}", email, e.getMessage());
            authorities.add(new SimpleGrantedAuthority("ROLE_DEFAULT"));
        }

        return authorities;
    }

    private void ensureAdminUserInDatabase(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                // Criar usuário ADMIN se não existir
                createAdminUser(email);
            } else {
                User user = userOpt.get();
                if (user.getUserRole() != UserRole.ADMIN) {
                    // Atualizar role para ADMIN se necessário
                    user.setUserRole(UserRole.ADMIN);
                    userRepository.save(user);
                    log.info("🔄 Updated role to ADMIN for special email: {}", email);
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Failed to sync admin user in database for {}: {}", email, e.getMessage());
            // Não falha - role ADMIN ainda é concedida via authorities
        }
    }

    private void createAdminUser(String email) {
        try {
            User adminUser = new User();
            adminUser.setEmail(email);
            adminUser.setName(extractNameFromEmail(email));
            adminUser.setUserRole(UserRole.ADMIN);
            adminUser.setDepartment("IT");
            adminUser.setCompany("Stefanini");
            adminUser.setIsActive(true);

            userRepository.save(adminUser);
            log.info("✅ Created ADMIN user for special email: {}", email);
        } catch (Exception e) {
            log.error("❌ Failed to create admin user for {}: {}", email, e.getMessage());
        }
    }

    private String extractNameFromEmail(String email) {
        // Extrair nome do email como fallback
        if (email != null && email.contains("@")) {
            String localPart = email.substring(0, email.indexOf("@"));
            // Converter algo como "lhfurquim" para "L. H. Furquim"
            return localPart.substring(0, 1).toUpperCase() + localPart.substring(1);
        }
        return email;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        return path.startsWith("/v1/api/health/") ||
               path.startsWith("/v1/api/public/") ||
               path.startsWith("/actuator/") ||
               path.startsWith("/swagger-ui/") ||
               path.startsWith("/v3/api-docs/") ||
               path.startsWith("/swagger-resources/") ||
               path.startsWith("/webjars/");
    }
}