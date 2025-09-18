CREATE TABLE TicketRPA_robots (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255),
    cell VARCHAR(255),
    technology VARCHAR(255),
    execution_type VARCHAR(50),
    client VARCHAR(50),
    status VARCHAR(50)
);
CREATE TABLE TicketRPA_submitter_info (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    department VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Usuário',
    is_active BIT NOT NULL DEFAULT 1,
    requests_submitted INT NOT NULL DEFAULT 0,
    last_activity DATETIME2,
    joined_at DATETIME2
);
CREATE TABLE TicketRPA_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    submitted_by VARCHAR(255),
    celula VARCHAR(255),
    submitter_info_id UNIQUEIDENTIFIER,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    robot VARCHAR(255),
    tecnologia_automacao VARCHAR(255),
    empresa VARCHAR(255),
    roi TEXT,
    cliente VARCHAR(255),
    servico VARCHAR(255),
    area_negocio VARCHAR(255),
    nome_processo VARCHAR(255),
    frequencia_execucao VARCHAR(255),
    sazonalidade VARCHAR(255),
    volumetria TEXT,
    duracao_cada_caso VARCHAR(255),
    quantas_pessoas_trabalham INT,
    fonte_dados_entrada VARCHAR(255),
    usa_mfa TEXT,
    existe_captcha TEXT,
    existe_certificado_digital TEXT,
    possivel_usar_api TEXT,
    possibilidade_usuario_robotico TEXT,
    limitacao_acesso_login TEXT,
    acesso_aplicacoes TEXT,
    rdp_opcao_positiva TEXT,
    necessita_vpn TEXT,
    analise_humana_etapa TEXT,
    restricao_tecnologia_sistema TEXT,
    regras_definidas VARCHAR(255),
    processo_repetitivo VARCHAR(255),
    dados_estruturados VARCHAR(255),
    ja_sustentada BIT,
    id_cliente VARCHAR(255),
    nome_cliente VARCHAR(255),
    id_servico VARCHAR(255),
    nome_servico VARCHAR(255),
    tem_documentacao BIT,
    usuario_automacao VARCHAR(255),
    servidor_automacao VARCHAR(255),
 
    CONSTRAINT FK_requests_submitter_info FOREIGN KEY (submitter_info_id)
        REFERENCES submitter_info(id)
);
CREATE TABLE TicketRPA_request_evidencias_files (
    request_id UNIQUEIDENTIFIER NOT NULL,
    file_name VARCHAR(255),
    CONSTRAINT FK_evidencias_request FOREIGN KEY (request_id)
        REFERENCES TicketRPA_requests(id)
);
CREATE TABLE TicketRPA_request_documentacao_files (
    request_id UNIQUEIDENTIFIER NOT NULL,
    file_name VARCHAR(255),
    CONSTRAINT FK_documentacao_request FOREIGN KEY (request_id)
        REFERENCES TicketRPA_requests(id)
);
