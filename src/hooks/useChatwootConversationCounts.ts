import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * Interface for conversation count filters
 * @param account_id - The Chatwoot account ID
 * @param status - Filter by conversation status (all, open, resolved, pending, snoozed)
 * @param inbox_id - Filter by inbox ID
 * @param team_id - Filter by team ID
 * @param labels - Filter by labels
 * @param q - Search term for filtering conversations
 */
export interface ConversationCountFilters {
  account_id: string;
  status?: string; // all, open, resolved, pending, snoozed
  inbox_id?: string;
  team_id?: string;
  labels?: string[];
  q?: string; // termo de pesquisa
}

/**
 * Interface for conversation counts response
 * @param mine_count - Count of conversations assigned to current agent
 * @param unassigned_count - Count of unassigned conversations
 * @param assigned_count - Count of assigned conversations
 * @param all_count - Total count of conversations
 */
export interface ConversationCounts {
  mine_count: number;
  unassigned_count: number;
  assigned_count: number;
  all_count: number;
}

/**
 * Hook to fetch conversation counts from Chatwoot API
 * Uses the /conversations/meta endpoint to get counts directly
 * @param filters - Filters for conversation counts
 * @returns Query result with conversation counts
 */
export const useChatwootConversationCounts = (filters: ConversationCountFilters) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['chatwoot-conversation-counts', filters],
    queryFn: async () => {
      console.log('🔍 Buscando contagens de conversas via proxy:', filters);
      
      // Construir URL para o endpoint /conversations/meta
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== "all") {
        params.append('status', filters.status);
        console.log(`📋 Filtrando contagens por status: ${filters.status}`);
      }
      
      if (filters.inbox_id && filters.inbox_id !== "all") {
        params.append('inbox_id', filters.inbox_id);
      }
      
      if (filters.team_id && filters.team_id !== "all") {
        params.append('team_id', filters.team_id);
      }
      
      if (filters.q) {
        params.append('q', filters.q);
      }
      
      if (filters.labels && filters.labels.length > 0) {
        filters.labels.forEach(label => {
          params.append('labels[]', label);
        });
      }
      
      const endpoint = `accounts/${filters.account_id}/conversations/meta`;
      const url = `/api/chatwoot-proxy.php?endpoint=${endpoint}&account_id=${filters.account_id}&${params.toString()}`;
      console.log('🔗 URL completa para contagens:', url);
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Contagens de conversas recebidas:', result);
        
        // Extrair dados de contagens
        let countsData: ConversationCounts = {
          mine_count: 0,
          unassigned_count: 0,
          assigned_count: 0,
          all_count: 0
        };
        
        if (result.meta) {
          countsData = result.meta;
        } else if (result.data?.meta) {
          countsData = result.data.meta;
        }
        
        console.log('📊 Contagens extraídas:', countsData);
        
        return countsData;
      } catch (error) {
        console.error('❌ Erro ao buscar contagens de conversas:', error);
        
        toast({
          title: "Erro ao carregar contagens",
          description: "Não foi possível carregar as contagens de conversas do Chatwoot",
          variant: "destructive",
        });
        
        throw error;
      }
    },
    enabled: !!filters.account_id,
    refetchInterval: 30000, // Atualiza a cada 30 segundos para atualizações em tempo real
    staleTime: 15000, // Considera os dados obsoletos após 15 segundos
  });
};