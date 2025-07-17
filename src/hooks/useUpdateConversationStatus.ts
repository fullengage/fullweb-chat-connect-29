import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useUpdateConversationStatus() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateStatus = async (conversationId: number, newStatus: string, accountId: string = "1") => {
    setLoading(true);
    
    try {
      console.log(`🔄 Atualizando status da conversa ${conversationId} para ${newStatus}`);
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}/toggle_status&account_id=${accountId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Status atualizado com sucesso:', result);
      
      toast({
        title: "Status atualizado",
        description: `Conversa movida para ${newStatus}`,
        variant: "default",
      });

      return result;
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da conversa",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mutateAsync = async ({ conversationId, status, accountId = "1" }: { 
    conversationId: number; 
    status: string; 
    accountId?: string;
  }) => {
    return updateStatus(conversationId, status, accountId);
  };

  return { 
    updateStatus, 
    mutateAsync, 
    loading, 
    isPending: loading 
  };
}