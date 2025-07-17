-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  description TEXT,
  account_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_labels junction table
CREATE TABLE IF NOT EXISTS conversation_labels (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  label_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, label_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_labels_account_id ON labels(account_id);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_conversation_id ON conversation_labels(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_label_id ON conversation_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_account_id ON conversation_labels(account_id);

-- Insert default labels
INSERT INTO labels (title, color, description, account_id) VALUES
('Urgente', '#EF4444', 'Conversas que precisam de atenção imediata', 1),
('Venda', '#10B981', 'Conversas relacionadas a vendas', 1),
('Suporte', '#3B82F6', 'Conversas de suporte técnico', 1),
('Bug', '#F59E0B', 'Relatos de bugs ou problemas', 1),
('Sugestão', '#8B5CF6', 'Sugestões de melhorias', 1),
('VIP', '#EC4899', 'Clientes VIP', 1)
ON CONFLICT DO NOTHING;