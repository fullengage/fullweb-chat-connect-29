import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Hook específico para buscar APENAS conversas resolvidas
export const useResolvedConversations = (accountId: string) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-resolved-conversations', accountId],
    queryFn: async () => {
      console.log('🔍 Buscando APENAS conversas resolvidas para account:', accountId)
      
      // Endpoint específico para conversas resolvidas seguindo a documentação
      const url = `/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations&account_id=${accountId}&status=resolved`
      console.log('🔗 URL para conversas resolvidas:', url)
      
      try {
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Erro HTTP ao buscar conversas resolvidas:', response.status, errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('✅ Resposta RAW da API para conversas resolvidas:', result)
        
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
        
        console.log('📊 CONVERSAS RESOLVIDAS EXTRAÍDAS:', conversationsData.length)
        console.log('🔍 DETALHES DAS CONVERSAS RESOLVIDAS:', conversationsData.map(c => ({
          id: c.id,
          status: c.status,
          contact_name: c.contact?.name || c.meta?.sender?.name || 'Sem nome',
          updated_at: c.updated_at
        })))
        
        // Filtrar apenas conversas com status resolved (dupla verificação)
        const resolvedOnly = conversationsData.filter(c => c.status === 'resolved')
        console.log('✅ CONVERSAS CONFIRMADAMENTE RESOLVIDAS:', resolvedOnly.length)
        
        return resolvedOnly
      } catch (error) {
        console.error('❌ Erro ao buscar conversas resolvidas:', error)
        
        toast({
          title: "Erro ao carregar conversas resolvidas",
          description: "Não foi possível carregar as conversas resolvidas",
          variant: "destructive",
        })
        
        throw error
      }
    },
    enabled: !!accountId,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 1000, // Consider data stale after 1 second
  })
}

// Hook para forçar uma conversa a ser resolvida (para teste)
export const useForceResolveConversation = () => {
  const { toast } = useToast()
  
  const forceResolve = async (conversationId: number, accountId: string) => {
    console.log(`🧪 FORÇANDO resolução da conversa ${conversationId}`)
    
    try {
      // Primeiro, vamos verificar o status atual
      const checkUrl = `/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}&account_id=${accountId}`
      const checkResponse = await fetch(checkUrl)
      const currentData = await checkResponse.json()
      console.log('📋 Status atual da conversa:', currentData)
      
      // Agora vamos forçar a resolução
      const resolveUrl = `/api/chatwoot-proxy.php?endpoint=accounts/${accountId}/conversations/${conversationId}&account_id=${accountId}`
      const response = await fetch(resolveUrl, {
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
        console.error('❌ Erro ao forçar resolução:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ Conversa FORÇADAMENTE resolvida:', result)
      
      toast({
        title: "Conversa resolvida com sucesso!",
        description: `Conversa ${conversationId} foi marcada como resolvida`,
        variant: "default",
      })
      
      return result
    } catch (error) {
      console.error('❌ Erro ao forçar resolução:', error)
      
      toast({
        title: "Erro ao resolver conversa",
        description: "Não foi possível marcar a conversa como resolvida",
        variant: "destructive",
      })
      
      throw error
    }
  }
  
  return { forceResolve }
}