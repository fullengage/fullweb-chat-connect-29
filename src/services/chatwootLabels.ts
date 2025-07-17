// Serviço para gerenciar etiquetas do Chatwoot via proxy
export interface ChatwootLabel {
  id: number;
  title: string;
  color: string;
  description?: string;
  show_on_sidebar: boolean;
}

export interface ChatwootConversationLabel {
  id: number;
  label_id: number;
  title: string;
  color: string;
  description?: string;
  show_on_sidebar: boolean;
}

const CHATWOOT_API_BASE = '/api/chatwoot-proxy.php';

// Buscar todas as etiquetas de uma conta
export async function fetchChatwootLabels(accountId: number): Promise<ChatwootLabel[]> {
  try {
    console.log('🏷️ Buscando etiquetas do Chatwoot para account_id:', accountId);
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/labels&account_id=${accountId}`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Etiquetas do Chatwoot encontradas:', data);
    
    return data.payload || data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar etiquetas do Chatwoot:', error);
    throw error;
  }
}

// Buscar etiquetas de uma conversa específica
export async function fetchConversationLabels(conversationId: number, accountId: number): Promise<ChatwootConversationLabel[]> {
  try {
    console.log('🏷️ Buscando etiquetas da conversa do Chatwoot:', conversationId);
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/conversations/${conversationId}/labels&account_id=${accountId}`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Etiquetas da conversa do Chatwoot encontradas:', data);
    
    return data.payload || data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar etiquetas da conversa do Chatwoot:', error);
    throw error;
  }
}

// Adicionar etiqueta a uma conversa
export async function addLabelToConversation(conversationId: number, labelId: number, accountId: number): Promise<void> {
  try {
    console.log('🏷️ Adicionando etiqueta do Chatwoot:', { conversationId, labelId, accountId });
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/conversations/${conversationId}/labels&account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        labels: [labelId]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    console.log('✅ Etiqueta adicionada à conversa no Chatwoot');
  } catch (error) {
    console.error('❌ Erro ao adicionar etiqueta no Chatwoot:', error);
    throw error;
  }
}

// Remover etiqueta de uma conversa
export async function removeLabelFromConversation(conversationId: number, labelId: number, accountId: number): Promise<void> {
  try {
    console.log('🏷️ Removendo etiqueta do Chatwoot:', { conversationId, labelId, accountId });
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/conversations/${conversationId}/labels/${labelId}&account_id=${accountId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    console.log('✅ Etiqueta removida da conversa no Chatwoot');
  } catch (error) {
    console.error('❌ Erro ao remover etiqueta no Chatwoot:', error);
    throw error;
  }
}

// Criar nova etiqueta
export async function createChatwootLabel(accountId: number, title: string, color: string, description?: string): Promise<ChatwootLabel> {
  try {
    console.log('🏷️ Criando nova etiqueta no Chatwoot:', { title, color, description, accountId });
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/labels&account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        color,
        description,
        show_on_sidebar: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Etiqueta criada no Chatwoot:', data);
    
    return data.payload || data;
  } catch (error) {
    console.error('❌ Erro ao criar etiqueta no Chatwoot:', error);
    throw error;
  }
}

// Atualizar etiqueta existente
export async function updateChatwootLabel(accountId: number, labelId: number, title: string, color: string, description?: string): Promise<ChatwootLabel> {
  try {
    console.log('🏷️ Atualizando etiqueta no Chatwoot:', { labelId, title, color, description, accountId });
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/labels/${labelId}&account_id=${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        color,
        description,
        show_on_sidebar: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Etiqueta atualizada no Chatwoot:', data);
    
    return data.payload || data;
  } catch (error) {
    console.error('❌ Erro ao atualizar etiqueta no Chatwoot:', error);
    throw error;
  }
}

// Deletar etiqueta
export async function deleteChatwootLabel(accountId: number, labelId: number): Promise<void> {
  try {
    console.log('🏷️ Deletando etiqueta no Chatwoot:', { labelId, accountId });
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/labels/${labelId}&account_id=${accountId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    console.log('✅ Etiqueta deletada no Chatwoot');
  } catch (error) {
    console.error('❌ Erro ao deletar etiqueta no Chatwoot:', error);
    throw error;
  }
}