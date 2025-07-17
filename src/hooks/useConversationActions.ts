import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// ✅ ARQUITETURA CORRETA: Hook dedicado para ações de CONVERSA
// Todas as ações de atendimento (status, agente, etiquetas) são da CONVERSA

interface UpdateConversationStatusParams {
  conversationId: number;
  status: 'open' | 'pending' | 'resolved';
  accountId: string | number;
}

interface AssignAgentParams {
  conversationId: number;
  agentId: number | string | null;
  accountId: string | number;
}

interface UpdateConversationPriorityParams {
  conversationId: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  accountId: string | number;
}

interface AddLabelToConversationParams {
  conversationId: number;
  labelId: number;
  accountId: string | number;
}

interface RemoveLabelFromConversationParams {
  conversationId: number;
  labelId: number;
  accountId: string | number;
}

export const useConversationActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ✅ CORRETO: Atualizar status da CONVERSA (não do contato)
  const updateStatus = useMutation({
    mutationFn: async ({ conversationId, status, accountId }: UpdateConversationStatusParams) => {
      console.log('🔄 Atualizando status da conversa:', { conversationId, status, accountId });
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}&account_id=${accountId}`, {
        method: 'PATCH',
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
      
      const result = await response.json();
      console.log('✅ Status da conversa atualizado:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['conversations-with-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chatwoot-conversations'] });
      
      toast({
        title: "Status atualizado",
        description: `Conversa marcada como ${variables.status}`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status da conversa",
        variant: "destructive",
      });
    }
  });

  // ✅ CORRETO: Atribuir agente à CONVERSA (não ao contato)
  const assignAgent = useMutation({
    mutationFn: async ({ conversationId, agentId, accountId }: AssignAgentParams) => {
      console.log('🔄 Atribuindo agente à conversa:', { conversationId, agentId, accountId });
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}&account_id=${accountId}`, {
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
      
      const result = await response.json();
      console.log('✅ Agente atribuído à conversa:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations-with-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chatwoot-conversations'] });
      
      toast({
        title: variables.agentId ? "Agente atribuído" : "Agente removido",
        description: variables.agentId ? "Conversa atribuída com sucesso" : "Atribuição removida",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao atribuir agente:', error);
      toast({
        title: "Erro na atribuição",
        description: "Não foi possível atribuir o agente à conversa",
        variant: "destructive",
      });
    }
  });

  // ✅ CORRETO: Atualizar prioridade da CONVERSA (não do contato)
  const updatePriority = useMutation({
    mutationFn: async ({ conversationId, priority, accountId }: UpdateConversationPriorityParams) => {
      console.log('🔄 Atualizando prioridade da conversa:', { conversationId, priority, accountId });
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}&account_id=${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priority: priority
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Prioridade da conversa atualizada:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations-with-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chatwoot-conversations'] });
      
      toast({
        title: "Prioridade atualizada",
        description: `Conversa marcada como prioridade ${variables.priority}`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao atualizar prioridade:', error);
      toast({
        title: "Erro ao atualizar prioridade",
        description: "Não foi possível alterar a prioridade da conversa",
        variant: "destructive",
      });
    }
  });

  // ✅ CORRETO: Adicionar etiqueta à CONVERSA (não ao contato)
  const addLabel = useMutation({
    mutationFn: async ({ conversationId, labelId, accountId }: AddLabelToConversationParams) => {
      console.log('🏷️ Adicionando etiqueta à conversa:', { conversationId, labelId, accountId });
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}/labels&account_id=${accountId}`, {
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
      
      const result = await response.json();
      console.log('✅ Etiqueta adicionada à conversa:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations-with-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chatwoot-conversations'] });
      
      toast({
        title: "Etiqueta adicionada",
        description: "Etiqueta adicionada à conversa com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao adicionar etiqueta:', error);
      toast({
        title: "Erro ao adicionar etiqueta",
        description: "Não foi possível adicionar a etiqueta à conversa",
        variant: "destructive",
      });
    }
  });

  // ✅ CORRETO: Remover etiqueta da CONVERSA (não do contato)
  const removeLabel = useMutation({
    mutationFn: async ({ conversationId, labelId, accountId }: RemoveLabelFromConversationParams) => {
      console.log('🏷️ Removendo etiqueta da conversa:', { conversationId, labelId, accountId });
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}/labels/${labelId}&account_id=${accountId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      console.log('✅ Etiqueta removida da conversa');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations-with-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chatwoot-conversations'] });
      
      toast({
        title: "Etiqueta removida",
        description: "Etiqueta removida da conversa com sucesso",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao remover etiqueta:', error);
      toast({
        title: "Erro ao remover etiqueta",
        description: "Não foi possível remover a etiqueta da conversa",
        variant: "destructive",
      });
    }
  });

  return {
    // Ações de status
    updateStatus: updateStatus.mutateAsync,
    isUpdatingStatus: updateStatus.isPending,
    
    // Ações de atribuição
    assignAgent: assignAgent.mutateAsync,
    isAssigningAgent: assignAgent.isPending,
    
    // Ações de prioridade
    updatePriority: updatePriority.mutateAsync,
    isUpdatingPriority: updatePriority.isPending,
    
    // Ações de etiquetas
    addLabel: addLabel.mutateAsync,
    removeLabel: removeLabel.mutateAsync,
    isManagingLabels: addLabel.isPending || removeLabel.isPending,
    
    // Estado geral
    isLoading: updateStatus.isPending || assignAgent.isPending || updatePriority.isPending || addLabel.isPending || removeLabel.isPending
  };
};