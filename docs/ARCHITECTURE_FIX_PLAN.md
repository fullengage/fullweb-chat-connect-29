# Plano de Correção da Arquitetura CRM

## Problemas Identificados

### ✅ Estrutura do Banco (CORRETA)
- **contacts**: Apenas dados pessoais (name, email, phone, avatar_url, custom_fields)
- **conversations**: Dados de atendimento (status, assignee_id, priority, complexity, due_date)
- **messages**: Apenas conteúdo e metadados da mensagem

### ❌ Problemas na Implementação

1. **Mistura de responsabilidades nos hooks**
2. **Lógica de atribuição inconsistente**
3. **Filtros baseados em dados errados**
4. **UI mostrando informações do lugar errado**

## Correções Necessárias

### 1. Refatorar Hooks de Dados

#### A. Separar responsabilidades claramente:
- `useContacts` → Apenas dados pessoais do contato
- `useConversations` → Dados de atendimento (status, agente, prioridade)
- `useMessages` → Histórico de mensagens

#### B. Corrigir fluxos de atribuição:
- Toda atribuição de agente/etiqueta/prioridade → PATCH na conversa
- Nunca alterar dados de atendimento no contato
- Nunca alterar dados de atendimento na mensagem

### 2. Corrigir Componentes UI

#### A. KanbanBoard:
- Filtrar conversas por `conversation.status` (não `contact.status`)
- Mostrar agente de `conversation.assignee_id` (não `contact.assignee`)
- Atualizar status via `PATCH /conversations/:id`

#### B. ConversationCard:
- Prioridade de `conversation.priority`
- Etiquetas de `conversation_labels` (tabela de relacionamento)
- Status de `conversation.status`

#### C. ContactProfile:
- Mostrar apenas dados pessoais
- Listar conversas deste contato (não status do contato)
- Cada conversa com seu próprio status/agente

### 3. Corrigir Serviços API

#### A. chatwootConversations.ts:
```typescript
// ✅ CORRETO - Atribuir agente na conversa
PATCH /conversations/:id { assignee_id: agentId }

// ✅ CORRETO - Alterar status na conversa  
PATCH /conversations/:id { status: newStatus }

// ✅ CORRETO - Adicionar etiqueta na conversa
POST /conversations/:id/labels { labels: [labelId] }
```

#### B. Remover funções incorretas:
- Não alterar status no contato
- Não alterar agente no contato
- Não alterar prioridade no contato

### 4. Corrigir Filtros e Relatórios

#### A. Filtros do Kanban:
```typescript
// ✅ CORRETO
const openConversations = conversations.filter(c => c.status === 'open')
const assignedToMe = conversations.filter(c => c.assignee_id === currentUserId)

// ❌ ERRADO
const openConversations = conversations.filter(c => c.contact.status === 'open')
```

#### B. Analytics:
- Métricas baseadas em `conversations` (não `contacts`)
- Tempo de resposta por conversa
- Performance por agente baseada em conversas atribuídas

### 5. Validações de Negócio

#### A. Regras de atribuição:
- Agente só pode ser atribuído a conversas (não contatos)
- Prioridade só existe em conversas (não contatos)
- Status é sempre da conversa (nunca do contato)

#### B. Regras de transição:
- Conversa resolvida pode ser reaberta (muda status da conversa)
- Contato pode ter múltiplas conversas com status diferentes
- Etiquetas são por conversa (não por contato)

## Implementação

### Fase 1: Corrigir Hooks (Crítico)
1. Refatorar `useConversationsWithMessages`
2. Criar `useConversationActions` separado
3. Remover lógica de atendimento dos hooks de contato

### Fase 2: Corrigir UI (Alto)
1. Atualizar KanbanBoard para usar dados corretos
2. Corrigir ConversationCard
3. Separar ContactProfile de ConversationDetails

### Fase 3: Corrigir Serviços (Alto)
1. Validar todos os endpoints de atualização
2. Garantir que alterações vão para a tabela correta
3. Adicionar validações de negócio

### Fase 4: Testes e Validação (Médio)
1. Testar fluxos de atribuição
2. Validar filtros e relatórios
3. Verificar consistência dos dados

## Checklist de Validação

- [ ] Atribuir agente altera apenas `conversations.assignee_id`
- [ ] Alterar status altera apenas `conversations.status`
- [ ] Adicionar etiqueta cria registro em `conversation_labels`
- [ ] Filtros do Kanban usam `conversations.status`
- [ ] ContactProfile mostra conversas do contato (não status do contato)
- [ ] Analytics baseados em dados de `conversations`
- [ ] Contato pode ter múltiplas conversas com status diferentes
- [ ] Nenhuma alteração de atendimento afeta tabela `contacts`

## Resultado Esperado

Após as correções:
- ✅ Dados consistentes entre tabelas
- ✅ Atribuições funcionando corretamente
- ✅ Filtros precisos
- ✅ Relatórios confiáveis
- ✅ Facilidade para integrar com outras plataformas
- ✅ Escalabilidade para múltiplas conversas por contato