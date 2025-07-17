# Guia de Consolidação dos Hooks

## 🎯 Objetivo

Finalizar a correção da arquitetura CRM garantindo que todos os hooks sigam a separação correta de responsabilidades:
- **Contatos**: Apenas dados pessoais
- **Conversas**: Dados de atendimento (status, agente, prioridade, etiquetas)
- **Mensagens**: Apenas histórico de comunicação

## 📋 Hooks para Auditar e Corrigir

### 1. Hooks Críticos (Já Corrigidos ✅)

#### A. `useConversationsWithMessages` ✅
- Interface corrigida com separação clara
- Contact sem dados de atendimento
- Conversation com todos os dados de atendimento

#### B. `useConversationActions` ✅
- Hook dedicado para ações de conversa
- Todas as ações atuam na conversa (não no contato)
- Estados de loading centralizados

### 2. Hooks para Validar (Próximos Passos)

#### A. `useChatwootConversationMessages`
**Status**: 🔍 Precisa auditoria
**Localização**: `src/hooks/useChatwootConversationMessages.ts`
**Verificações necessárias**:
```typescript
// ✅ Verificar se não mistura responsabilidades
interface ChatwootMessage {
  id: number;
  content: string;
  // ❌ NÃO deve ter: assignee_id, status, priority
  // ✅ Apenas: conteúdo, sender, timestamps
}

// ✅ Verificar se UpdateConversationParams está correto
interface UpdateConversationParams {
  conversationId: number; // ✅ Correto
  status?: string;        // ✅ Correto - atualiza conversa
  assigneeId?: number;    // ✅ Correto - atualiza conversa
  // ❌ NÃO deve ter: contactId para atualizar status
}
```

#### B. `useLabels` / `useConversationLabels`
**Status**: 🔍 Precisa auditoria
**Localização**: `src/hooks/useLabels.ts`
**Verificações necessárias**:
```typescript
// ✅ Verificar se busca etiquetas da CONVERSA
const { data: conversationLabels } = useConversationLabels(
  conversationId, // ✅ Correto
  accountId
)

// ❌ NÃO deve buscar etiquetas do contato
// const { data: contactLabels } = useContactLabels(contactId) // ERRADO
```

#### C. `useChatwootConversations`
**Status**: 🔍 Precisa auditoria
**Verificações necessárias**:
- Filtros baseados em `conversation.status`
- Ordenação por `conversation.updated_at`
- Não misturar dados de contato com conversa

### 3. Hooks que Podem Não Existir (Criar se Necessário)

#### A. `useContacts` (Dados Pessoais Apenas)
```typescript
// ✅ Hook dedicado para dados pessoais
export const useContacts = (accountId: number) => {
  return useQuery({
    queryKey: ['contacts', accountId],
    queryFn: async () => {
      // Buscar apenas: name, email, phone, avatar_url, custom_fields
      // SEM: status, assignee_id, priority
    }
  });
};
```

#### B. `useConversationFilters` (Filtros Corretos)
```typescript
// ✅ Hook para filtros baseados em conversas
export const useConversationFilters = () => {
  const filterByStatus = (conversations, status) => 
    conversations.filter(c => c.status === status); // ✅ Correto
  
  const filterByAssignee = (conversations, agentId) => 
    conversations.filter(c => c.assignee_id === agentId); // ✅ Correto
  
  // ❌ NUNCA filtrar por contact.status ou contact.assignee
};
```

#### C. `useConversationStats` (Métricas Corretas)
```typescript
// ✅ Hook para métricas baseadas em conversas
export const useConversationStats = (accountId: number) => {
  return useQuery({
    queryKey: ['conversation-stats', accountId],
    queryFn: async () => {
      // Métricas baseadas em conversations table
      // - Total por status
      // - Performance por agente (baseado em assignee_id)
      // - Tempo médio de resposta por conversa
    }
  });
};
```

## 🔧 Plano de Ação

### Fase 1: Auditoria dos Hooks Existentes

1. **Auditar `useChatwootConversationMessages`**
   - Verificar interface `ChatwootMessage`
   - Validar `UpdateConversationParams`
   - Confirmar que não altera dados de contato

2. **Auditar `useLabels`**
   - Verificar se busca etiquetas da conversa
   - Confirmar que não busca etiquetas do contato
   - Validar operações de adicionar/remover

3. **Auditar `useChatwootConversations`**
   - Verificar filtros e ordenação
   - Confirmar separação de responsabilidades
   - Validar queries de busca

### Fase 2: Criar Hooks Faltantes (Se Necessário)

1. **Criar `useContacts`** (se não existir)
   - Apenas dados pessoais
   - Sem dados de atendimento

2. **Criar `useConversationFilters`**
   - Filtros baseados em conversas
   - Funções de ordenação corretas

3. **Criar `useConversationStats`**
   - Métricas baseadas em conversas
   - Analytics por agente corretos

### Fase 3: Validação e Testes

1. **Testes de Integração**
   - Atribuir agente altera apenas conversa
   - Alterar status altera apenas conversa
   - Filtros funcionam corretamente

2. **Validação de Dados**
   - Nenhuma alteração afeta tabela contacts
   - Mensagens não têm dados de atendimento
   - Relatórios usam dados corretos

## 📝 Checklist de Validação por Hook

### `useChatwootConversationMessages`
- [ ] Interface `ChatwootMessage` sem dados de atendimento
- [ ] `UpdateConversationParams` atualiza apenas conversa
- [ ] Não altera dados de contato
- [ ] Estados de loading corretos

### `useLabels` / `useConversationLabels`
- [ ] Busca etiquetas da conversa (não do contato)
- [ ] Operações de adicionar/remover na conversa
- [ ] Interface correta para etiquetas
- [ ] Relacionamento conversation_labels

### `useChatwootConversations`
- [ ] Filtros baseados em conversation.status
- [ ] Ordenação por conversation.updated_at
- [ ] Não mistura dados de contato
- [ ] Queries otimizadas

### Hooks Novos (Se Criados)
- [ ] `useContacts` - apenas dados pessoais
- [ ] `useConversationFilters` - filtros corretos
- [ ] `useConversationStats` - métricas baseadas em conversas

## 🎯 Resultado Final Esperado

Após a consolidação, todos os hooks devem seguir a arquitetura correta:

```typescript
// ✅ CORRETO: Separação clara de responsabilidades
const contacts = useContacts(accountId)           // Apenas dados pessoais
const conversations = useConversations(accountId) // Dados de atendimento
const messages = useMessages(conversationId)     // Apenas histórico

// ✅ CORRETO: Ações na entidade correta
const actions = useConversationActions()
await actions.updateStatus(conversationId, 'resolved', accountId)
await actions.assignAgent(conversationId, agentId, accountId)

// ✅ CORRETO: Filtros baseados na entidade correta
const openConversations = conversations.filter(c => c.status === 'open')
const myConversations = conversations.filter(c => c.assignee_id === userId)
```

## 🚨 Sinais de Alerta (O que NÃO deve existir)

```typescript
// ❌ ERRADO: Dados misturados
contact.status = 'open'
contact.assignee_id = agentId
message.priority = 'high'

// ❌ ERRADO: Filtros incorretos
conversations.filter(c => c.contact.status === 'open')
contacts.filter(c => c.assignee_id === agentId)

// ❌ ERRADO: Ações na entidade errada
updateContact(contactId, { status: 'resolved' })
updateMessage(messageId, { assignee_id: agentId })
```