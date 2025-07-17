# 📋 Regras de Negócio e Integridade – Sistema de Chat Multiempresa

## 1. Isolamento Multiempresa
- Toda query deve ser filtrada por `account_id`.
- Proibido acessar dados de outra empresa/tenant.
- O backend/proxy é responsável por garantir o isolamento.

## 2. Integridade de Relacionamento
- Não pode existir conversa ou mensagem sem contato válido (`contact_phone`).
- FKs garantem integridade, mas o backend deve validar antes de inserir.
- Toda mensagem/conversa deve referenciar um contato existente.

## 3. Unicidade de Contato
- Cada `phone` deve ser único por empresa (`account_id, phone`).
- Recomenda-se constraint UNIQUE(account_id, phone) em `contacts`.

## 4. Segurança
- Tokens e segredos nunca devem ser expostos no frontend.
- Integrações (ex: Chatwoot) sempre via backend/proxy seguro.
- Nunca trafegar dados sensíveis diretamente para o cliente.

## 5. CRUD via Proxy/API
- Toda ação de chat (agentes, contatos, conversas, mensagens) deve passar pelo proxy seguro.
- Hooks React customizados sempre usam endpoints do proxy.

## 6. Consistência de Mensagens
- Mensagens só podem ser criadas se a conversa e o contato existirem e pertencerem ao mesmo `account_id`.
- O backend/proxy deve validar a integridade antes de inserir.

## 7. Extensibilidade
- Hooks e serviços devem ser genéricos e prontos para integrações futuras (outros canais, CRMs, etc).
- Não acoplar lógica de canal/integração no core do chat.

## 8. UX/Feedback
- Sempre mostrar loading/skeleton enquanto dados não chegam.
- Mensagens de erro amigáveis e informativas em falhas de comunicação.

---

### Observações
- Antes de remover colunas ou constraints, sempre faça backup.
- Teste os relacionamentos com SELECTs e JOINs após cada alteração.
- Documente para o time toda mudança estrutural relevante.

---

*Arquivo gerado automaticamente via análise do modelo e melhores práticas para sistemas SaaS multiempresa.* 