import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface ConversationFilters {
  account_id: string;
  status: string;
  assignee_id: string;
  inbox_id: string;
  team_id: string;
  labels: string[];
  page: number;
}

export const useChatwootConversations = (filters: ConversationFilters) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-proxy-conversations', filters],
    queryFn: async () => {
      console.log('🔍 Buscando conversas via proxy:', filters)
      
      // Construir URL seguindo a documentação oficial do Chatwoot
      // https://developers.chatwoot.com/api-reference/conversations/list-all-conversations
      const params = new URLSearchParams()
      
      // Adicionar filtros específicos seguindo a API do Chatwoot
      if (filters.status !== "all") {
        params.append('status', filters.status)
        console.log(`📋 Filtrando por status: ${filters.status}`)
      }
      
      if (filters.assignee_id !== "all") {
        if (filters.assignee_id === "unassigned") {
          params.append('assignee_type', 'unassigned')
        } else {
          params.append('assignee_type', 'assigned')
          params.append('assignee_id', filters.assignee_id)
        }
      }
      
      if (filters.inbox_id !== "all") {
        params.append('inbox_id', filters.inbox_id)
      }
      
      // Adicionar paginação
      params.append('page', filters.page.toString())
      
      const endpoint = `accounts/${filters.account_id}/conversations`
      const url = `https://fjihzmwtdqnigkqbugrh.supabase.co/functions/v1/chatwoot-conversations?account_id=${filters.account_id}&${params.toString()}`
      console.log('🔗 URL completa (edge function):', url)
      
      try {
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('✅ Conversas recebidas via proxy:', result)
        
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
        
        console.log('📊 Total de conversas extraídas:', conversationsData.length)
        
        // Log específico para conversas resolvidas
        if (filters.status === 'resolved') {
          console.log('🔍 CONVERSAS RESOLVIDAS ENCONTRADAS:', conversationsData.map(c => ({
            id: c.id,
            status: c.status,
            contact_name: c.contact?.name || c.meta?.sender?.name || 'Sem nome'
          })))
        }
        
        return conversationsData
      } catch (error) {
        console.error('❌ Erro ao buscar conversas via proxy:', error)
        
        toast({
          title: "Erro ao carregar conversas",
          description: "Não foi possível carregar as conversas do Chatwoot",
          variant: "destructive",
        })
        
        throw error
      }
    },
    enabled: !!filters.account_id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  })
}