-- Adiciona coluna user_role à tabela submitter_info (User)
ALTER TABLE submitter_info ADD COLUMN user_role VARCHAR(50) DEFAULT 'DEFAULT';

-- Atualiza todos os usuários existentes com role DEFAULT como padrão
UPDATE submitter_info SET user_role = 'DEFAULT' WHERE user_role IS NULL;

-- Adiciona constraint para garantir que apenas valores válidos sejam aceitos
ALTER TABLE submitter_info ADD CONSTRAINT chk_user_role
    CHECK (user_role IN ('DEFAULT', 'ANALYST', 'DEVELOP', 'ADMIN'));