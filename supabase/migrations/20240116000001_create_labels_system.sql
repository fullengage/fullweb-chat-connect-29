-- Criar tabela de etiquetas (labels)
CREATE TABLE IF NOT EXISTS public.labels (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    description TEXT,
    account_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(title, account_id)
);

-- Criar tabela de relacionamento entre conversas e etiquetas
CREATE TABLE IF NOT EXISTS public.conversation_labels (
    id BIGSERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    label_id BIGINT REFERENCES public.labels(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(conversation_id, label_id, account_id)
);

-- Criar tabela para configurações do Kanban
CREATE TABLE IF NOT EXISTS public.kanban_stages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    status_mapping VARCHAR(50) NOT NULL, -- 'open', 'pending', 'resolved'
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    icon VARCHAR(50),
    position INTEGER NOT NULL DEFAULT 0,
    account_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(title, account_id)
);

-- Inserir etiquetas padrão
INSERT INTO public.labels (title, color, description, account_id) VALUES
('VIP', '#FFD700', 'Cliente VIP', 1),
('Suporte', '#4CAF50', 'Suporte técnico', 1),
('Vendas', '#2196F3', 'Processo de vendas', 1),
('Urgente', '#F44336', 'Prioridade alta', 1),
('Feedback', '#FF9800', 'Feedback do cliente', 1)
ON CONFLICT (title, account_id) DO NOTHING;

-- Inserir estágios padrão do Kanban
INSERT INTO public.kanban_stages (title, status_mapping, color, icon, position, account_id) VALUES
('Abertas', 'open', '#4CAF50', 'Clock', 1, 1),
('Pendentes', 'pending', '#FF9800', 'AlertCircle', 2, 1),
('Resolvidas', 'resolved', '#2196F3', 'CheckCircle', 3, 1),
('Não Atribuídas', 'unassigned', '#F44336', 'Users', 0, 1)
ON CONFLICT (title, account_id) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_stages ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para labels
CREATE POLICY "Users can view labels from their account" ON public.labels
    FOR SELECT USING (account_id = 1); -- Por enquanto, account_id fixo

CREATE POLICY "Users can insert labels in their account" ON public.labels
    FOR INSERT WITH CHECK (account_id = 1);

CREATE POLICY "Users can update labels in their account" ON public.labels
    FOR UPDATE USING (account_id = 1);

CREATE POLICY "Users can delete labels in their account" ON public.labels
    FOR DELETE USING (account_id = 1);

-- Políticas de segurança para conversation_labels
CREATE POLICY "Users can view conversation labels from their account" ON public.conversation_labels
    FOR SELECT USING (account_id = 1);

CREATE POLICY "Users can insert conversation labels in their account" ON public.conversation_labels
    FOR INSERT WITH CHECK (account_id = 1);

CREATE POLICY "Users can delete conversation labels in their account" ON public.conversation_labels
    FOR DELETE USING (account_id = 1);

-- Políticas de segurança para kanban_stages
CREATE POLICY "Users can view kanban stages from their account" ON public.kanban_stages
    FOR SELECT USING (account_id = 1);

CREATE POLICY "Users can insert kanban stages in their account" ON public.kanban_stages
    FOR INSERT WITH CHECK (account_id = 1);

CREATE POLICY "Users can update kanban stages in their account" ON public.kanban_stages
    FOR UPDATE USING (account_id = 1);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON public.labels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_labels_account_id ON public.labels(account_id);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_conversation_id ON public.conversation_labels(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_labels_account_id ON public.conversation_labels(account_id);
CREATE INDEX IF NOT EXISTS idx_kanban_stages_account_id ON public.kanban_stages(account_id);
CREATE INDEX IF NOT EXISTS idx_kanban_stages_position ON public.kanban_stages(position);