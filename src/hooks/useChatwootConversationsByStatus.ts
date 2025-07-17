import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface ConversationStatusFilters {
  account_id: string;
  status: 'open' | 'pending' | 'resolved' | 'all';
  assignee_id?: string;
  inbox_id?: string;
}

// Hook específico para buscar conversas por status
export const useChatwootConversationsByStatus = (filters: ConversationStatusFilters) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-conversations-by-status', filters],
    queryFn: async () => {
      console.log('🔍 Buscando conversas por status:', filters)
      
      // Construir URL com filtros corretos
      const params = new URLSearchParams({
        account_id: filters.account_id
      })
      
      // Adicionar filtro de status específico
      if (filters.status !== "all") {
        params.append('status', filters.status)
        console.log(`📋 Filtrando por status: ${filters.status}`)
      }
      
      if (filters.assignee_id && filters.assignee_id !== "all") {
        params.append('assignee_id', filters.assignee_id)
      }
      
      if (filters.inbox_id && filters.inbox_id !== "all") {
        params.append('inbox_id', filters.inbox_id)
      }
      
      const url = `/api/chatwoot-proxy.php?endpoint=accounts/${filters.account_id}/conversations&${params.toString()}`
      console.log('🔗 URL para buscar conversas:', url)
      
      try {
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Erro HTTP:', response.status, errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('✅ Resposta da API:', result)
        
        // Extrair dados das conversas
        let conversationsData = []
        if (Array.isArray(result)) {
          conversationsData = result
        } else if (result.data?.payload) {
          conversationsData = result.data.payload
        } else if (result.payload) {
          conversationsData = result.payload
        } else if (result.data) {
          conversationsData = result.data
        }
        
        console.log(`📊 Total de conversas ${filters.status}:`, conversationsData.length)
        
        // Log detalhado das conversas resolvidas
        if (filters.status === 'resolved') {
          console.log('🔍 Conversas resolvidas encontradas:', conversationsData.map(c => ({
            id: c.id,
            status: c.status,
            contact_name: c.contact?.name || c.meta?.sender?.name
          })))
        }
        
        return conversationsData
      } catch (error) {
        console.error('❌ Erro ao buscar conversas por status:', error)
        
        toast({
          title: "Erro ao carregar conversas",
          description: `Não foi possível carregar as conversas ${filters.status}`,
          variant: "destructive",
        })
        
        throw error
      }
    },
    enabled: !!filters.account_id,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    staleTime: 5000, // Consider data stale after 5 seconds
  })
}

// Hook para testar manualmente uma conversa resolvida
export const useTestResolvedConversation = () => {
  const { toast } = useToast()
  
  const testResolveConversation = async (conversationId: number, accountId: string) => {
    console.log(`🧪 Testando resolução da conversa ${conversationId}`)
    
    try {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}&account_id=${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'resolved'
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao resolver conversa:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ Conversa resolvida com sucesso:', result)
      
      toast({
        title: "Conversa resolvida",
        description: `Conversa ${conversationId} marcada como resolvida`,
        variant: "default",
      })
      
      return result
    } catch (error) {
      console.error('❌ Erro ao testar resolução:', error)
      
      toast({
        title: "Erro ao resolver conversa",
        description: "Não foi possível marcar a conversa como resolvida",
        variant: "destructive",
      })
      
      throw error
    }
  }
  
  return { testResolveConversation }
}