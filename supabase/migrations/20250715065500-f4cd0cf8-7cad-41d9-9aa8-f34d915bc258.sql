-- Criar políticas RLS para a tabela conversations
CREATE POLICY "Users can view conversations from their account" 
ON public.conversations 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'superadmin'::text) 
  OR 
  (
    (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'agent'::text])) 
    AND (account_id = get_user_account_id(auth.uid()))
  )
);

-- Permitir operações de INSERT, UPDATE e DELETE para admins e superadmins
CREATE POLICY "Admins and superadmins can manage conversations" 
ON public.conversations 
FOR ALL 
USING (
  (get_user_role(auth.uid()) = 'superadmin'::text) 
  OR 
  (
    (get_user_role(auth.uid()) = 'admin'::text) 
    AND (account_id = get_user_account_id(auth.uid()))
  )
);

-- Permitir que agentes atualizem conversas atribuídas a eles
CREATE POLICY "Agents can update assigned conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  (get_user_role(auth.uid()) = 'agent'::text) 
  AND (account_id = get_user_account_id(auth.uid()))
  AND (assignee_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
);

-- Criar políticas RLS para a tabela messages
CREATE POLICY "Users can view messages from conversations in their account" 
ON public.messages 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'superadmin'::text) 
  OR 
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.account_id = get_user_account_id(auth.uid())
    AND (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'agent'::text]))
  )
);

-- Permitir inserir mensagens
CREATE POLICY "Users can insert messages in conversations from their account" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  (get_user_role(auth.uid()) = 'superadmin'::text) 
  OR 
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.account_id = get_user_account_id(auth.uid())
    AND (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'agent'::text]))
  )
);

-- Permitir que admins e superadmins gerenciem mensagens
CREATE POLICY "Admins and superadmins can manage messages" 
ON public.messages 
FOR ALL 
USING (
  (get_user_role(auth.uid()) = 'superadmin'::text) 
  OR 
  (
    (get_user_role(auth.uid()) = 'admin'::text) 
    AND EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.account_id = get_user_account_id(auth.uid())
    )
  )
);

-- Criar políticas RLS para a tabela contacts
CREATE POLICY "Users can view contacts from their account" 
ON public.contacts 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'superadmin'::text) 
  OR 
  (
    (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'agent'::text])) 
    AND (account_id = get_user_account_id(auth.uid()))
  )
);

-- Permitir que admins e superadmins gerenciem contatos
CREATE POLICY "Admins and superadmins can manage contacts" 
ON public.contacts 
FOR ALL 
USING (
  (get_user_role(auth.uid()) = 'superadmin'::text) 
  OR 
  (
    (get_user_role(auth.uid()) = 'admin'::text) 
    AND (account_id = get_user_account_id(auth.uid()))
  )
);