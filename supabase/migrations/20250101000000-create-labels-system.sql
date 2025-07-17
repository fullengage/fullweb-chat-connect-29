-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_labels_account_id ON labels(account_id);
CREATE INDEX IF NOT EXISTS idx_labels_title ON labels(title);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_conversation_id ON conversation_labels(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_label_id ON conversation_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_account_id ON conversation_labels(account_id);

-- Add foreign key constraints
ALTER TABLE labels 
ADD CONSTRAINT fk_labels_account_id 
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

ALTER TABLE conversation_labels 
ADD CONSTRAINT fk_conversation_labels_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE conversation_labels 
ADD CONSTRAINT fk_conversation_labels_label_id 
FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE;

ALTER TABLE conversation_labels 
ADD CONSTRAINT fk_conversation_labels_account_id 
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_labels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for labels
CREATE POLICY "Users can view labels from their account" ON labels
    FOR SELECT USING (account_id IN (
        SELECT account_id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can insert labels in their account" ON labels
    FOR INSERT WITH CHECK (account_id IN (
        SELECT account_id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update labels in their account" ON labels
    FOR UPDATE USING (account_id IN (
        SELECT account_id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can delete labels in their account" ON labels
    FOR DELETE USING (account_id IN (
        SELECT account_id FROM users WHERE auth_user_id = auth.uid()
    ));

-- Create RLS policies for conversation_labels
CREATE POLICY "Users can view conversation labels from their account" ON conversation_labels
    FOR SELECT USING (account_id IN (
        SELECT account_id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can insert conversation labels in their account" ON conversation_labels
    FOR INSERT WITH CHECK (account_id IN (
        SELECT account_id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can delete conversation labels in their account" ON conversation_labels
    FOR DELETE USING (account_id IN (
        SELECT account_id FROM users WHERE auth_user_id = auth.uid()
    ));

-- Insert some default labels
INSERT INTO labels (title, color, description, account_id) VALUES
    ('Urgente', '#EF4444', 'Conversas que precisam de atenção imediata', 1),
    ('Venda', '#10B981', 'Conversas relacionadas a vendas', 1),
    ('Suporte', '#3B82F6', 'Conversas de suporte técnico', 1),
    ('Bug', '#F59E0B', 'Relatos de bugs ou problemas', 1),
    ('Sugestão', '#8B5CF6', 'Sugestões de melhorias', 1),
    ('VIP', '#EC4899', 'Clientes VIP', 1)
ON CONFLICT DO NOTHING; 