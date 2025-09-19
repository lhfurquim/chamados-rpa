# Sistema de Roles - RPA Chamados

## Visão Geral

Este documento descreve a implementação do sistema de roles robusta e seguindo as melhores práticas do Java/Spring. O sistema implementa uma hierarquia de permissões baseada no princípio do menor privilégio.

## Roles Disponíveis

### DEFAULT
- **Permissões**: Criação de requests apenas
- **Endpoints permitidos**:
  - `POST /v1/api/calls/melhoria` - Criar request de melhoria
  - `POST /v1/api/calls/sustentacao` - Criar request de sustentação
  - `POST /v1/api/calls/novo-projeto` - Criar request de novo projeto
- **Restrições**: Não pode acessar relatórios, dashboard ou outras operações

### ANALYST
- **Permissões**: Todas as permissões de DEFAULT + CRUD completo de Demands (demandas) + Acesso a relatórios
- **Endpoints permitidos**:
  - Todos os endpoints de DEFAULT
  - `POST /v1/api/demands` - Criar demanda
  - `PUT /v1/api/demands` - Atualizar demanda
  - `DELETE /v1/api/demands/{id}` - Deletar demanda
  - `GET /v1/api/demands/**` - Consultar demandas (todos os endpoints GET)
  - `GET /v1/api/calls/**` - Acessar relatórios e dashboard

### DEVELOP
- **Permissões**: Todas as permissões de DEFAULT + CRUD completo de Tracking (apontamento de horas) + Acesso a relatórios
- **Endpoints permitidos**:
  - Todos os endpoints de DEFAULT
  - `POST /v1/api/trackings` - Criar tracking
  - `PUT /v1/api/trackings` - Atualizar tracking
  - `DELETE /v1/api/trackings/{id}` - Deletar tracking
  - `GET /v1/api/trackings/**` - Consultar trackings (todos os endpoints GET)
  - `GET /v1/api/calls/**` - Acessar relatórios e dashboard

### ADMIN
- **Permissões**: Acesso completo a todas as funcionalidades do sistema
- **Endpoints permitidos**:
  - Todos os endpoints de DEFAULT, ANALYST e DEVELOP
  - `POST /v1/api/clients` - Criar cliente
  - `PUT /v1/api/clients` - Atualizar cliente
  - `DELETE /v1/api/clients/{id}` - Deletar cliente
  - `POST /v1/api/robots` - Criar robot
  - `PUT /v1/api/robots` - Atualizar robot
  - `DELETE /v1/api/robots/{id}` - Deletar robot
  - `POST /v1/api/projects` - Criar projeto
  - `PUT /v1/api/projects` - Atualizar projeto
  - `DELETE /v1/api/projects/{id}` - Deletar projeto

## Arquitetura da Implementação

### 1. Enum UserRole
```java
public enum UserRole {
    DEFAULT, ANALYST, DEVELOP, ADMIN
}
```

### Hierarquia de Roles
```
DEFAULT (mais restritivo)
  ↓
ANALYST (DEFAULT + gerenciamento de demandas + relatórios)
  ↓
DEVELOP (DEFAULT + gerenciamento de tracking + relatórios)
  ↓
ADMIN (todas as permissões - menos restritivo)
```

### 2. Anotação @RequiresRole
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresRole {
    UserRole[] value();
}
```

### 3. Aspect de Autorização (AOP)
- **Classe**: `RoleAuthorizationAspect`
- **Função**: Intercepta métodos anotados com `@RequiresRole`
- **Validação**: Verifica se o usuário atual possui alguma das roles requeridas

### 4. Service de Autorização
- **Classe**: `UserRoleAuthorizationService`
- **Funções**:
  - `hasAnyRole(UserRole... requiredRoles)` - Verifica permissões
  - `getCurrentUserRole()` - Obtém role do usuário atual
  - `getCurrentUserEmail()` - Obtém email do usuário atual

### 5. Integração com JWT
- **Classe**: `JwtAuthenticationFilter`
- **Função**: Carrega role do usuário do banco e adiciona às authorities do Spring Security
- **Authorities criadas**:
  - `ROLE_USER` (para todos)
  - `ROLE_ANALYST` / `ROLE_DEVELOP` / `ROLE_ADMIN` (baseado na role do usuário)

## Configuração

### Habilitação do AOP
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@EnableAspectJAutoProxy
public class SecurityConfig {
    // ...
}
```

### Dependências Adicionadas
```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aop</artifactId>
</dependency>
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
</dependency>
```

## Uso nos Controladores

### Exemplo - Single Role
```java
@PostMapping
@RequiresRole(UserRole.ADMIN)
public ResponseEntity<ClientDto> createClient(@RequestBody CreateClientRequest request) {
    // Apenas ADMIN pode acessar
}
```

### Exemplo - Multiple Roles
```java
@PostMapping
@RequiresRole({UserRole.ANALYST, UserRole.ADMIN})
public ResponseEntity<DemandDto> createDemand(@RequestBody CreateDemandRequest request) {
    // ANALYST ou ADMIN podem acessar
}
```

## Tratamento de Exceções

### InsufficientRoleException
- **Status HTTP**: 403 FORBIDDEN
- **Código de erro**: "INSUFFICIENT_ROLE"
- **Tratada por**: `GlobalExceptionHandler`

### Resposta de Erro
```json
{
    "message": "Access denied. Current role: DEVELOP. Required role(s): [ADMIN]",
    "errorCode": "INSUFFICIENT_ROLE",
    "path": "/v1/api/clients",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## Migração de Dados

### Script SQL
```sql
-- Arquivo: V2__add_user_role_column.sql
ALTER TABLE submitter_info ADD COLUMN user_role VARCHAR(50) DEFAULT 'DEFAULT';
UPDATE submitter_info SET user_role = 'DEFAULT' WHERE user_role IS NULL;
ALTER TABLE submitter_info ADD CONSTRAINT chk_user_role
    CHECK (user_role IN ('DEFAULT', 'ANALYST', 'DEVELOP', 'ADMIN'));
```

## Testes Implementados

### 1. Testes Unitários
- **UserRoleAuthorizationServiceTest**: Valida lógica de verificação de permissões
- **RoleAuthorizationAspectTest**: Testa interceptação AOP e tratamento de exceções

### 2. Testes de Integração
- **RoleBasedAccessControlIntegrationTest**: Valida acesso por role em endpoints reais
- **RoleScenarioValidationTest**: Testa 12 cenários específicos de uso

### 3. Cenários de Teste Validados
- ✅ DEFAULT pode criar requests, negado para outras operações
- ✅ ANALYST pode criar requests + gerenciar demands + acessar relatórios
- ✅ DEVELOP pode criar requests + gerenciar tracking + acessar relatórios
- ✅ ADMIN pode acessar todas as funcionalidades
- ✅ Usuário sem role definida usa fallback para DEFAULT
- ✅ Token JWT inválido/expirado retorna 401
- ✅ Acesso negado retorna 403 com mensagem clara
- ✅ Concorrência entre usuários com roles diferentes
- ✅ Hierarquia de permissões funcionando corretamente

## Benefícios da Implementação

1. **Princípio do Menor Privilégio**: DEFAULT como role padrão (mais seguro)
2. **Separação de Responsabilidades**: AOP separa lógica de autorização da lógica de negócio
3. **Type Safety**: Uso de enums evita erros de strings
4. **Flexibilidade**: Fácil adição de novas roles
5. **Integração**: Compatível com Spring Security
6. **Manutenibilidade**: Código organizado e testável
7. **Cobertura de Testes**: Testes robustos com 12+ cenários validados
8. **Logs**: Sistema completo de logging para auditoria

## Extensibilidade

Para adicionar uma nova role:

1. Adicionar ao enum `UserRole`
2. Atualizar constraint no banco de dados
3. Aplicar anotações `@RequiresRole` nos controladores necessários
4. Atualizar documentação

## Segurança

- Verificação de role a cada requisição
- Fallback para role padrão (ANALYST) em caso de erro
- Logs de auditoria para todas as tentativas de acesso
- Integração com JWT para autenticação
- Tratamento seguro de exceções