import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 'incoming' | 'outgoing';
  sender_type: 'contact' | 'agent' | 'system';
  sender_id?: number;
  created_at: string;
  updated_at: string;
  conversation_id: number;
  sender?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  [key: string]: any;
}

export interface SendMessageParams {
  accountId: string;
  conversationId: number;
  content: string;
  messageType?: 'outgoing' | 'incoming';
}

export interface UpdateConversationParams {
  accountId: string;
  conversationId: number;
  status?: string;
  assigneeId?: number | null;
}

// Main hook for fetching conversation messages
export function useChatwootConversationMessages(accountId: string, conversationId: number | null) {
  return useQuery({
    queryKey: ['chatwoot-messages', accountId, conversationId],
    queryFn: async () => {
      if (!accountId || !conversationId) {
        return [];
      }

      // Primeiro, tentar buscar mensagens específicas
      let url = `/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}/messages&account_id=${accountId}`;
      console.log('Tentativa 1 - Buscando mensagens da URL:', url);
      
      let response = await fetch(url);
      let res = await response.json();
      
      console.log('Resposta da tentativa 1:', res);
      
      let messagesData = [];
      
      // Se não conseguir buscar mensagens específicas, tentar buscar a conversa completa
      if (!res.data?.payload && !res.payload && !res.data && !Array.isArray(res)) {
        console.log('Tentativa 2 - Buscando conversa completa para extrair mensagens');
        url = `/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}&account_id=${accountId}`;
        response = await fetch(url);
        res = await response.json();
        
        console.log('Resposta da tentativa 2 (conversa completa):', res);
        
        // Extrair mensagens da conversa completa
        if (res.data?.payload?.messages) {
          messagesData = res.data.payload.messages;
        } else if (res.payload?.messages) {
          messagesData = res.payload.messages;
        } else if (res.data?.messages) {
          messagesData = res.data.messages;
        } else if (res.messages) {
          messagesData = res.messages;
        }
      } else {
        // Extrair mensagens da resposta de mensagens específicas
        if (res.data?.payload) {
          messagesData = res.data.payload;
        } else if (res.payload) {
          messagesData = res.payload;
        } else if (res.data) {
          messagesData = res.data;
        } else if (Array.isArray(res)) {
          messagesData = res;
        }
      }
      
      console.log('Mensagens extraídas:', messagesData);
      console.log('Número de mensagens encontradas:', messagesData.length);
      
      // Verificar se messagesData é um array válido
      if (!Array.isArray(messagesData)) {
        console.warn('Dados de mensagens não são um array:', messagesData);
        messagesData = [];
      }
      
      // Ordenar mensagens por data de criação (mais antigas primeiro)
      const sortedMessages = messagesData.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
        const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
        return dateA - dateB;
      });
      
      console.log('Mensagens ordenadas:', sortedMessages);
      return sortedMessages;
    },
    enabled: !!accountId && !!conversationId,
    staleTime: 30 * 1000, // 30 seconds for real-time feel
  });
}

// Hook for sending messages
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ accountId, conversationId, content, messageType = 'outgoing' }: SendMessageParams) => {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}/messages&account_id=${accountId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          message_type: messageType,
          private: false
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-messages', variables.accountId, variables.conversationId] 
      });
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

// Hook for updating conversations (status, assignee)
export function useUpdateConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ accountId, conversationId, status, assigneeId }: UpdateConversationParams) => {
      let result;

      // Se for atribuição de agente, usar endpoint específico
      if (assigneeId !== undefined) {
        console.log('🔍 Atribuindo agente:', assigneeId, 'para conversa:', conversationId);
        
        const response = await fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}/assignments&account_id=${accountId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignee_id: assigneeId
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na resposta da API:', response.status, errorText);
          throw new Error(`Erro ao atribuir agente: ${response.status}`);
        }

        result = await response.json();
        console.log('🔍 Resposta da atribuição:', result);
      }

      // Se for mudança de status, usar endpoint de conversa
      if (status) {
        console.log('🔍 Atualizando status:', status, 'para conversa:', conversationId);
        
        const response = await fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversationId}&account_id=${accountId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: status
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na resposta da API:', response.status, errorText);
          throw new Error(`Erro ao atualizar status: ${response.status}`);
        }

        result = await response.json();
        console.log('🔍 Resposta da atualização de status:', result);
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-messages', variables.accountId, variables.conversationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-conversations'] 
      });
      
      if (variables.assigneeId !== undefined) {
        toast({
          title: variables.assigneeId ? "Agente atribuído" : "Agente removido",
          description: variables.assigneeId ? "Agente atribuído com sucesso" : "Atribuição removida com sucesso",
          variant: "default",
        });
      }
      
      if (variables.status) {
        toast({
          title: "Status atualizado",
          description: "Status da conversa atualizado com sucesso",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar conversa:', error);
      toast({
        title: "Erro ao atualizar conversa",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

// Legacy compatibility exports
export const useChatwootMessages = () => {
  const sendMessage = useSendMessage();
  const updateConversation = useUpdateConversation();
  
  return {
    sendMessage: sendMessage.mutateAsync,
    updateConversation: updateConversation.mutateAsync,
    loading: sendMessage.isPending || updateConversation.isPending
  };
};