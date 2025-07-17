-- Criar tabelas para etiquetas customizadas
-- Estas etiquetas são específicas do nosso sistema e não existem no Chatwoot

-- Tabela de etiquetas customizadas
CREATE TABLE custom_labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280', -- Hex color
  description TEXT,
  account_id INTEGER NOT NULL, -- ID da conta no Chatwoot
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento entre contatos e etiquetas customizadas
CREATE TABLE contact_custom_labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id INTEGER NOT NULL, -- ID do contato no Chatwoot (não duplicamos dados)
  custom_label_id UUID NOT NULL REFERENCES custom_labels(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL, -- Para facilitar queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicatas
  UNIQUE(contact_id, custom_label_id)
);

-- Tabela de relacionamento entre conversas e etiquetas customizadas
CREATE TABLE conversation_custom_labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id INTEGER NOT NULL, -- ID da conversa no Chatwoot (não duplicamos dados)
  custom_label_id UUID NOT NULL REFERENCES custom_labels(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL, -- Para facilitar queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicatas
  UNIQUE(conversation_id, custom_label_id)
);

-- Índices para performance
CREATE INDEX idx_custom_labels_account_id ON custom_labels(account_id);
CREATE INDEX idx_contact_custom_labels_contact_id ON contact_custom_labels(contact_id);
CREATE INDEX idx_contact_custom_labels_account_id ON contact_custom_labels(account_id);
CREATE INDEX idx_conversation_custom_labels_conversation_id ON conversation_custom_labels(conversation_id);
CREATE INDEX idx_conversation_custom_labels_account_id ON conversation_custom_labels(account_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_labels_updated_at 
    BEFORE UPDATE ON custom_labels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - cada conta só vê suas próprias etiquetas
ALTER TABLE custom_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_custom_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_custom_labels ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (assumindo que temos auth.uid() disponível)
-- Ajuste conforme sua implementação de autenticação
CREATE POLICY "Users can view custom labels from their account" ON custom_labels
    FOR SELECT USING (true); -- Ajustar conforme sua lógica de auth

CREATE POLICY "Users can insert custom labels to their account" ON custom_labels
    FOR INSERT WITH CHECK (true); -- Ajustar conforme sua lógica de auth

CREATE POLICY "Users can update custom labels from their account" ON custom_labels
    FOR UPDATE USING (true); -- Ajustar conforme sua lógica de auth

CREATE POLICY "Users can delete custom labels from their account" ON custom_labels
    FOR DELETE USING (true); -- Ajustar conforme sua lógica de auth

-- Políticas similares para as tabelas de relacionamento
CREATE POLICY "Users can view contact custom labels from their account" ON contact_custom_labels
    FOR SELECT USING (true);

CREATE POLICY "Users can insert contact custom labels to their account" ON contact_custom_labels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete contact custom labels from their account" ON contact_custom_labels
    FOR DELETE USING (true);

CREATE POLICY "Users can view conversation custom labels from their account" ON conversation_custom_labels
    FOR SELECT USING (true);

CREATE POLICY "Users can insert conversation custom labels to their account" ON conversation_custom_labels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete conversation custom labels from their account" ON conversation_custom_labels
    FOR DELETE USING (true);