// Serviço para gerenciar conversas do Chatwoot via proxy

const CHATWOOT_API_BASE = '/api/chatwoot-proxy.php';

// Atribuir agente a uma conversa
export async function assignAgentToConversation(
  conversationId: number, 
  agentId: number | null, 
  accountId: string | number
): Promise<void> {
  try {
    console.log('🔄 Atribuindo agente:', { conversationId, agentId, accountId });
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/conversations/${conversationId}&account_id=${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assignee_id: agentId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    console.log('✅ Agente atribuído com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atribuir agente:', error);
    throw error;
  }
}

// Alterar status de uma conversa
export async function updateConversationStatus(
  conversationId: number, 
  status: string, 
  accountId: string | number
): Promise<void> {
  try {
    console.log('🔄 Alterando status:', { conversationId, status, accountId });
    
    const response = await fetch(`${CHATWOOT_API_BASE}?endpoint=accounts/${accountId}/conversations/${conversationId}/toggle_status&account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    console.log('✅ Status alterado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao alterar status:', error);
    throw error;
  }
}