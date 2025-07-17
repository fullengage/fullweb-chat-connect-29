# Design Document - Finalização do SaaS de Atendimento ao Cliente

## Overview

Este documento detalha a arquitetura técnica e implementação para finalizar o SaaS de atendimento ao cliente. O sistema seguirá uma arquitetura modular baseada em hooks personalizados, proxy para Chatwoot, e componentes reutilizáveis seguindo as regras estabelecidas.

## Architecture

### Arquitetura Geral
```
Frontend (React + TypeScript)
├── Hooks Personalizados (useChatwoot*)
├── Proxy Local (Vite)
├── API Proxy (api.chathook.com.br)
└── Chatwoot Backend
```

### Fluxo de Dados
1. **Frontend** → Hook personalizado
2. **Hook** → Proxy local (Vite)
3. **Proxy local** → API Proxy externa
4. **API Proxy** → Chatwoot Backend
5. **Resposta** segue caminho inverso

## Components and Interfaces

### 1. Sistema Kanban

#### Componentes Necessários
- `KanbanBoard` (já existe, precisa correção)
- `KanbanColumn` 
- `ConversationKanbanCard`
- `KanbanDragProvider`

#### Hooks
```typescript
// Hook existente que precisa correção
useChatwootConversations(accountId: string)

// Novo hook para atualização de status
useUpdateConversationStatus() {
  const updateStatus = async (conversationId: number, newStatus: string) => {
    await fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}&account_id=${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })
  }
}
```

#### Interface de Dados
```typescript
interface KanbanConversation {
  id: number
  status: 'open' | 'pending' | 'resolved'
  contact: ContactInfo
  lastMessage: string
  updatedAt: string
  assignee?: Agent
  labels: Label[]
}
```

### 2. Sistema de Anexos

#### Componentes
- `FileUploadButton`
- `AttachmentPreview`
- `FileDownloadLink`
- `ImageViewer`

#### Hook de Upload
```typescript
useFileUpload() {
  const uploadFile = async (file: File, conversationId: number) => {
    const formData = new FormData()
    formData.append('attachments[]', file)
    formData.append('message_type', 'outgoing')
    
    return fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}/messages&account_id=${accountId}`, {
      method: 'POST',
      body: formData // Não usar Content-Type header para FormData
    })
  }
}
```

#### Renderização de Anexos
```typescript
interface AttachmentMessage {
  id: number
  content: string
  attachments: Array<{
    id: number
    file_type: string
    data_url: string
    thumb_url?: string
    file_size: number
  }>
}
```

### 3. Mensagens Privadas

#### Componente
- `PrivateMessageToggle`
- `PrivateMessageIndicator`

#### Hook Atualizado
```typescript
useChatwootMessages() {
  const sendMessage = async ({
    content,
    isPrivate = false,
    conversationId,
    accountId
  }) => {
    return fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}/messages&account_id=${accountId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        message_type: 'outgoing',
        private: isPrivate
      })
    })
  }
}
```

### 4. Sistema de Atribuição

#### Componentes
- `AgentAssignmentDropdown`
- `AssignedAgentBadge`
- `UnassignedIndicator`

#### Hook de Atribuição
```typescript
useConversationAssignment() {
  const assignAgent = async (conversationId: number, agentId: number | null) => {
    return fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}&account_id=${accountId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignee_id: agentId
      })
    })
  }
}
```

### 5. Sistema de Etiquetas

#### Componentes
- `LabelSelector`
- `LabelBadge`
- `LabelManager`

#### Hook de Labels
```typescript
useConversationLabels() {
  const addLabel = async (conversationId: number, labelId: number) => {
    return fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}/labels&account_id=${accountId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labels: [labelId] })
    })
  }
  
  const removeLabel = async (conversationId: number, labelId: number) => {
    return fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}/labels/${labelId}&account_id=${accountId}`, {
      method: 'DELETE'
    })
  }
}
```

### 6. Autenticação Multi-Tenant

#### Context Provider
```typescript
interface AuthContextType {
  user: User | null
  accountId: string
  role: 'agent' | 'supervisor' | 'administrator'
  permissions: Permission[]
}

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState<AuthContextType>()
  
  useEffect(() => {
    // Verificar token e extrair accountId
    const token = localStorage.getItem('auth_token')
    if (token) {
      const decoded = jwt.decode(token)
      setAuthState({
        user: decoded.user,
        accountId: decoded.account_id,
        role: decoded.role,
        permissions: decoded.permissions
      })
    }
  }, [])
}
```

#### Hook de Autenticação
```typescript
useAuth() {
  const { accountId, role, permissions } = useContext(AuthContext)
  
  const hasPermission = (permission: string) => {
    return permissions.includes(permission)
  }
  
  const canAccessConversation = (conversation: Conversation) => {
    if (role === 'administrator') return true
    if (role === 'supervisor') return true
    if (role === 'agent') return conversation.assignee_id === user.id
    return false
  }
}
```

### 7. Sistema de Chatbot

#### Componentes
- `ChatbotConfig`
- `AutoResponseIndicator`
- `BotTransferButton`

#### Hook de Chatbot
```typescript
useChatbot() {
  const triggerBot = async (conversationId: number, message: string) => {
    // Integração com n8n ou sistema de automação
    return fetch('/api/chatbot/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
        account_id: accountId
      })
    })
  }
}
```

## Data Models

### Conversation Model
```typescript
interface Conversation {
  id: number
  account_id: number
  status: 'open' | 'pending' | 'resolved'
  assignee_id?: number
  assignee?: Agent
  contact: Contact
  inbox: Inbox
  messages: Message[]
  labels: Label[]
  created_at: string
  updated_at: string
  last_activity_at: string
  unread_count: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  custom_attributes: Record<string, any>
}
```

### Message Model
```typescript
interface Message {
  id: number
  content: string
  message_type: 'incoming' | 'outgoing'
  sender_type: 'contact' | 'agent' | 'system'
  sender_id?: number
  private: boolean
  created_at: string
  attachments: Attachment[]
  conversation_id: number
}
```

### User/Agent Model
```typescript
interface Agent {
  id: number
  account_id: number
  name: string
  email: string
  role: 'agent' | 'supervisor' | 'administrator'
  availability_status: 'online' | 'offline' | 'busy'
  avatar_url?: string
  permissions: Permission[]
}
```

## Error Handling

### Estratégia de Tratamento de Erros
1. **Network Errors**: Retry automático com backoff exponencial
2. **Authentication Errors**: Redirect para login
3. **Permission Errors**: Exibir mensagem de acesso negado
4. **Validation Errors**: Destacar campos com erro
5. **Server Errors**: Fallback graceful com mensagem amigável

### Error Boundary
```typescript
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Application Error:', error)
      setHasError(true)
      // Enviar erro para serviço de monitoramento
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  if (hasError) {
    return <ErrorFallback onRetry={() => setHasError(false)} />
  }
  
  return children
}
```

## Testing Strategy

### Testes Unitários
- Hooks personalizados (useChatwoot*)
- Componentes de UI
- Funções utilitárias
- Validações de dados

### Testes de Integração
- Fluxo completo de envio de mensagem
- Atribuição de agentes
- Upload de arquivos
- Autenticação multi-tenant

### Testes E2E
- Jornada completa do agente
- Fluxo de atendimento ao cliente
- Funcionalidades do supervisor
- Configurações de administrador

### Ferramentas
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: MSW (Mock Service Worker)
- **E2E Tests**: Playwright ou Cypress
- **Coverage**: Mínimo 80% de cobertura

## Performance Considerations

### Otimizações
1. **Lazy Loading**: Componentes carregados sob demanda
2. **Memoization**: React.memo para componentes pesados
3. **Virtual Scrolling**: Para listas grandes de conversas
4. **Debouncing**: Para busca e filtros
5. **Caching**: Cache inteligente de dados do Chatwoot

### Monitoramento
- **Web Vitals**: Core Web Vitals tracking
- **Error Tracking**: Sentry ou similar
- **Performance Monitoring**: Tempo de resposta das APIs
- **User Analytics**: Hotjar ou similar para UX

## Security Considerations

### Medidas de Segurança
1. **CORS**: Configuração adequada no proxy
2. **CSRF Protection**: Tokens CSRF em formulários
3. **XSS Prevention**: Sanitização de conteúdo
4. **File Upload**: Validação rigorosa de tipos e tamanhos
5. **Rate Limiting**: Limite de requests por usuário

### Autenticação e Autorização
- **JWT Tokens**: Com expiração adequada
- **Role-Based Access**: Controle granular de permissões
- **Session Management**: Logout automático por inatividade
- **Multi-Factor Auth**: Para administradores (futuro)

## Deployment Strategy

### Ambientes
1. **Development**: Local com proxy para staging
2. **Staging**: Ambiente de testes com dados simulados
3. **Production**: Ambiente final com dados reais

### CI/CD Pipeline
1. **Build**: Compilação e otimização
2. **Test**: Execução de todos os testes
3. **Security Scan**: Verificação de vulnerabilidades
4. **Deploy**: Deploy automático após aprovação
5. **Monitoring**: Verificação de saúde pós-deploy