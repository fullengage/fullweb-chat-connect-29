// Comprehensive Chatwoot API service implementing all required endpoints

const CHATWOOT_API_BASE = '/api/chatwoot-proxy.php';

export interface ConversationFilters {
  account_id: string;
  assignee_id?: string;
  status?: 'open' | 'resolved' | 'pending' | 'snoozed' | 'all';
  inbox_id?: string;
  team_id?: string;
  labels?: string[];
  page?: number;
}

export interface ContactFilters {
  account_id: string;
  page?: number;
  search?: string;
}

export interface MessageFilters {
  conversation_id: number;
  page?: number;
}

export interface UpdateConversationData {
  status?: 'open' | 'resolved' | 'pending' | 'snoozed';
  assignee_id?: number | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CreateLabelData {
  title: string;
  color: string;
  description?: string;
}

export interface CreateNoteData {
  content: string;
  user_id?: number;
}

class ChatwootAPI {
  private baseURL = CHATWOOT_API_BASE;

  // GET /conversations - Buscar conversas (geral ou por agente)
  async getConversations(filters: ConversationFilters) {
    const params = new URLSearchParams({
      endpoint: `accounts/${filters.account_id}/conversations`,
      account_id: filters.account_id
    });

    // Adicionar filtros específicos
    if (filters.assignee_id && filters.assignee_id !== 'all') {
      if (filters.assignee_id === 'unassigned') {
        params.append('assignee_type', 'unassigned');
      } else {
        params.append('assignee_type', 'assigned');
        params.append('assignee_id', filters.assignee_id);
      }
    }

    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    if (filters.inbox_id && filters.inbox_id !== 'all') {
      params.append('inbox_id', filters.inbox_id);
    }

    if (filters.team_id && filters.team_id !== 'all') {
      params.append('team_id', filters.team_id);
    }

    if (filters.labels && filters.labels.length > 0) {
      params.append('labels', filters.labels.join(','));
    }

    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // PATCH /conversations/{id} - Atualizar status/atribuição da conversa
  async updateConversation(conversationId: number, accountId: string, data: UpdateConversationData) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/conversations/${conversationId}`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // POST /conversations/{id}/toggle_status - Método alternativo para status
  async toggleConversationStatus(conversationId: number, accountId: string, status: string) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/conversations/${conversationId}/toggle_status`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // GET /contacts - Buscar contatos
  async getContacts(filters: ContactFilters) {
    const params = new URLSearchParams({
      endpoint: `accounts/${filters.account_id}/contacts`,
      account_id: filters.account_id
    });

    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    if (filters.search) {
      params.append('q', filters.search);
    }

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // GET /messages - Histórico de mensagens por conversa
  async getMessages(conversationId: number, accountId: string, filters?: MessageFilters) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/conversations/${conversationId}/messages`,
      account_id: accountId
    });

    if (filters?.page) {
      params.append('page', filters.page.toString());
    }

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // POST /labels - Gerenciar etiquetas (criar)
  async createLabel(accountId: string, data: CreateLabelData) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/labels`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // GET /labels - Buscar etiquetas
  async getLabels(accountId: string) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/labels`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // POST /conversations/{id}/labels - Adicionar etiqueta à conversa
  async addLabelToConversation(conversationId: number, accountId: string, labelIds: number[]) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/conversations/${conversationId}/labels`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labels: labelIds })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // DELETE /conversations/{id}/labels/{labelId} - Remover etiqueta da conversa
  async removeLabelFromConversation(conversationId: number, accountId: string, labelId: number) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/conversations/${conversationId}/labels/${labelId}`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.ok;
  }

  // POST /notes - Adicionar notas (implementação baseada na API do Chatwoot)
  async createNote(conversationId: number, accountId: string, data: CreateNoteData) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/conversations/${conversationId}/messages`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: data.content,
        message_type: 'private',
        private: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // GET /agents - Buscar agentes
  async getAgents(accountId: string) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/agents`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // GET /inboxes - Buscar inboxes
  async getInboxes(accountId: string) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/inboxes`,
      account_id: accountId
    });

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // GET /conversations/meta - Buscar estatísticas de conversas
  async getConversationMeta(accountId: string, filters?: Partial<ConversationFilters>) {
    const params = new URLSearchParams({
      endpoint: `accounts/${accountId}/conversations/meta`,
      account_id: accountId
    });

    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    if (filters?.inbox_id && filters.inbox_id !== 'all') {
      params.append('inbox_id', filters.inbox_id);
    }

    if (filters?.team_id && filters.team_id !== 'all') {
      params.append('team_id', filters.team_id);
    }

    if (filters?.labels && filters.labels.length > 0) {
      params.append('labels', filters.labels.join(','));
    }

    const response = await fetch(`${this.baseURL}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const chatwootApi = new ChatwootAPI();
export default chatwootApi;