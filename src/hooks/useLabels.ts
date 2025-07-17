import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  fetchChatwootLabels,
  fetchConversationLabels,
  addLabelToConversation as addLabelToChatwootConversation,
  removeLabelFromConversation as removeLabelFromChatwootConversation,
  createChatwootLabel,
  updateChatwootLabel,
  deleteChatwootLabel,
  ChatwootLabel,
  ChatwootConversationLabel
} from "@/services/chatwootLabels";

// Usando as interfaces do Chatwoot
export type Label = ChatwootLabel;
export type ConversationLabel = ChatwootConversationLabel;

// Hook para buscar todas as etiquetas de uma conta
export function useLabels(accountId: number) {
  return useQuery({
    queryKey: ['chatwoot-labels', accountId],
    queryFn: () => fetchChatwootLabels(accountId),
    enabled: !!accountId,
  });
}

// Hook para buscar etiquetas de uma conversa específica
export function useConversationLabels(conversationId: number, accountId: number) {
  return useQuery({
    queryKey: ['chatwoot-conversation-labels', conversationId, accountId],
    queryFn: () => fetchConversationLabels(conversationId, accountId),
    enabled: !!conversationId && !!accountId,
  });
}

// Hook para adicionar etiqueta a uma conversa
export function useAddLabelToConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      labelId, 
      accountId 
    }: { 
      conversationId: number; 
      labelId: number; 
      accountId: number; 
    }) => {
      await addLabelToChatwootConversation(conversationId, labelId, accountId);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-conversation-labels', variables.conversationId, variables.accountId] 
      });
      
      toast({
        title: "Etiqueta adicionada",
        description: `A etiqueta foi adicionada à conversa`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao adicionar etiqueta:', error);
      
      toast({
        title: "Erro ao adicionar etiqueta",
        description: error.message || "Não foi possível adicionar a etiqueta",
        variant: "destructive",
      });
    },
  });
}

// Hook para remover etiqueta de uma conversa
export function useRemoveLabelFromConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      labelId, 
      accountId 
    }: { 
      conversationId: number; 
      labelId: number; 
      accountId: number; 
    }) => {
      await removeLabelFromChatwootConversation(conversationId, labelId, accountId);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-conversation-labels', variables.conversationId, variables.accountId] 
      });
      
      toast({
        title: "Etiqueta removida",
        description: `A etiqueta foi removida da conversa`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao remover etiqueta:', error);
      
      toast({
        title: "Erro ao remover etiqueta",
        description: error.message || "Não foi possível remover a etiqueta",
        variant: "destructive",
      });
    },
  });
}

// Hook para criar nova etiqueta
export function useCreateLabel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      title, 
      color, 
      description, 
      accountId 
    }: { 
      title: string; 
      color: string; 
      description?: string; 
      accountId: number; 
    }) => {
      return await createChatwootLabel(accountId, title, color, description);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-labels', variables.accountId] 
      });
      
      toast({
        title: "Etiqueta criada",
        description: `A etiqueta "${data.title}" foi criada com sucesso`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao criar etiqueta:', error);
      
      toast({
        title: "Erro ao criar etiqueta",
        description: error.message || "Não foi possível criar a etiqueta",
        variant: "destructive",
      });
    },
  });
}

// Hook para atualizar etiqueta
export function useUpdateLabel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      labelId,
      title, 
      color, 
      description, 
      accountId 
    }: { 
      labelId: number;
      title: string; 
      color: string; 
      description?: string; 
      accountId: number; 
    }) => {
      return await updateChatwootLabel(accountId, labelId, title, color, description);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-labels', variables.accountId] 
      });
      
      toast({
        title: "Etiqueta atualizada",
        description: `A etiqueta "${data.title}" foi atualizada com sucesso`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao atualizar etiqueta:', error);
      
      toast({
        title: "Erro ao atualizar etiqueta",
        description: error.message || "Não foi possível atualizar a etiqueta",
        variant: "destructive",
      });
    },
  });
}

// Hook para deletar etiqueta
export function useDeleteLabel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      labelId,
      accountId 
    }: { 
      labelId: number;
      accountId: number; 
    }) => {
      await deleteChatwootLabel(accountId, labelId);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['chatwoot-labels', variables.accountId] 
      });
      
      toast({
        title: "Etiqueta deletada",
        description: `A etiqueta foi deletada com sucesso`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao deletar etiqueta:', error);
      
      toast({
        title: "Erro ao deletar etiqueta",
        description: error.message || "Não foi possível deletar a etiqueta",
        variant: "destructive",
      });
    },
  });
}