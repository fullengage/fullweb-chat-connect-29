import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

export interface ChatwootAgent {
  id: number;
  account_id: number;
  availability_status: 'online' | 'offline' | 'busy';
  auto_offline: boolean;
  confirmed: boolean;
  email: string;
  available_name: string;
  name: string;
  role: 'agent' | 'administrator' | 'supervisor';
  thumbnail?: string;
  custom_role_id?: number | null;
  phone?: string;
  [key: string]: any;
}

export interface AgentWithStats extends ChatwootAgent {
  status: string;
  teams?: string[];
  conversationsToday: number;
  avgResponseTime: string;
  resolutionRate: number;
  initials: string;
  isOnline: boolean;
  stats?: {
    rating: number;
  };
}

// Legacy interface for backward compatibility
export interface Agent extends AgentWithStats {
  is_active: boolean;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

// Main hook for fetching agents (using TanStack Query for better caching)
export function useChatwootAgents(accountId: string = "1") {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['chatwoot-agents', accountId],
    queryFn: async () => {
      if (!accountId) throw new Error('Account ID is required');
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=agents&account_id=${accountId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Resposta da API de agentes:', result);
      
      // Extrair dados dos agentes
      let agentsData = [];
      if (Array.isArray(result)) {
        agentsData = result;
      } else if (result.data?.payload) {
        agentsData = result.data.payload;
      } else if (result.payload) {
        agentsData = result.payload;
      } else if (result.data) {
        agentsData = result.data;
      }
      
      console.log('Agentes extraídos:', agentsData);
      
      // Converter para o formato esperado pelos componentes
      const agentsWithStats: AgentWithStats[] = agentsData.map((agent: ChatwootAgent) => {
        const initials = agent.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        
        return {
          ...agent,
          status: agent.availability_status || 'offline',
          teams: [], // Pode ser expandido futuramente
          conversationsToday: Math.floor(Math.random() * 20), // Dados simulados por enquanto
          avgResponseTime: `${Math.floor(Math.random() * 10) + 1}min`,
          resolutionRate: Math.floor(Math.random() * 40) + 60,
          initials,
          isOnline: agent.availability_status === 'online',
          stats: {
            rating: Math.floor(Math.random() * 2) + 4 // Rating entre 4-5
          },
          phone: agent.phone || ''
        };
      });
      
      return agentsWithStats;
    },
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Legacy hook name for backward compatibility
export const useAgents = useChatwootAgents;

// Hook para criar agente
export function useCreateChatwootAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (agentData: {
      account_id: string;
      name: string;
      email: string;
      role: 'agent' | 'administrator' | 'supervisor';
      phone?: string;
    }) => {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=agents&account_id=${agentData.account_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentData.name,
          email: agentData.email,
          role: agentData.role,
          phone: agentData.phone,
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar agente');
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatwoot-agents', variables.account_id] });
      toast({
        title: "Agente criado",
        description: "O agente foi criado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar agente:', error);
      toast({
        title: "Erro ao criar agente",
        description: "Não foi possível criar o agente. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

// Hook para atualizar agente
export function useUpdateChatwootAgent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (agentData: {
      id: number;
      account_id: string;
      name?: string;
      email?: string;
      role?: 'agent' | 'administrator' | 'supervisor';
      availability_status?: 'online' | 'offline' | 'busy';
      phone?: string;
    }) => {
      const { id, account_id, ...updateData } = agentData;
      
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=agents/${id}&account_id=${account_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar agente');
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatwoot-agents', variables.account_id] });
      toast({
        title: "Agente atualizado",
        description: "Os dados do agente foram atualizados com sucesso",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar agente:', error);
      toast({
        title: "Erro ao atualizar agente",
        description: "Não foi possível atualizar o agente. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

// Legacy hooks for backward compatibility
export const useCreateAgent = useCreateChatwootAgent;
export const useUpdateAgent = useUpdateChatwootAgent;