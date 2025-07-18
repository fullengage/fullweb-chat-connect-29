import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// ✅ ARQUITETURA CORRETA: Separação clara de responsabilidades
export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  // Apenas dados pessoais - SEM status, agente ou prioridade
}

export interface ConversationWithMessages {
  id: number;
  display_id: number;
  // ✅ DADOS DE ATENDIMENTO ficam na conversa
  status: 'open' | 'pending' | 'resolved';
  assignee_id?: number | string; // Pode ser string no Chatwoot
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  complexity?: 'simple' | 'medium' | 'complex';
  due_date?: string;
  // Relacionamentos
  contact_id: number;
  inbox_id: number;
  account_id: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  // ✅ Contato é apenas dados pessoais
  contact: Contact;
  // ✅ Agente atribuído à CONVERSA (não ao contato)
  assignee?: {
    id: number | string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  // ✅ Mensagens são apenas histórico
  messages: Array<{
    id: number;
    content: string;
    message_type: 'incoming' | 'outgoing';
    sender_type: 'contact' | 'agent' | 'system';
    created_at: string;
    sender?: {
      id: number;
      name: string;
      avatar_url?: string;
    };
    // SEM dados de atendimento nas mensagens
  }>;
  // ✅ Etiquetas são da CONVERSA (não do contato)
  labels?: Array<{
    id: number;
    title: string;
    color: string;
  }>;
  // Add missing properties
  messages_count?: number;
  last_message?: {
    id: number;
    content: string;
    created_at: string;
  };
}

// Hook para buscar conversas com mensagens
export const useConversationsWithMessages = () => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['conversations-with-messages', authUser?.id],
    queryFn: async () => {
      if (!authUser) {
        throw new Error('User not authenticated');
      }

      try {
        // Por enquanto retorna dados simulados
        // Pode ser integrado com Chatwoot conforme necessário
        const mockConversations: ConversationWithMessages[] = [
          {
            id: 1,
            display_id: 1001,
            status: 'open',
            assignee_id: 1,
            contact_id: 1,
            inbox_id: 1,
            account_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            contact: {
              id: 1,
              name: 'João Silva',
              email: 'joao@example.com',
              phone: '+55 11 99999-9999',
            },
            assignee: {
              id: 1,
              name: 'Maria Santos',
              email: 'maria@company.com',
            },
            messages: [
              {
                id: 1,
                content: 'Olá, preciso de ajuda com meu pedido',
                message_type: 'incoming',
                sender_type: 'contact',
                created_at: new Date(Date.now() - 60000).toISOString(),
                sender: {
                  id: 1,
                  name: 'João Silva',
                }
              },
              {
                id: 2,
                content: 'Olá João! Claro, vou te ajudar. Qual é o número do seu pedido?',
                message_type: 'outgoing',
                sender_type: 'agent',
                created_at: new Date().toISOString(),
                sender: {
                  id: 1,
                  name: 'Maria Santos',
                }
              }
            ],
            labels: [
              {
                id: 1,
                title: 'Suporte',
                color: '#3B82F6'
              }
            ],
            messages_count: 2,
            last_message: {
              id: 2,
              content: 'Olá João! Claro, vou te ajudar. Qual é o número do seu pedido?',
              created_at: new Date().toISOString(),
            }
          },
          {
            id: 2,
            display_id: 1002,
            status: 'pending',
            contact_id: 2,
            inbox_id: 1,
            account_id: 1,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 1800000).toISOString(),
            last_activity_at: new Date(Date.now() - 1800000).toISOString(),
            contact: {
              id: 2,
              name: 'Ana Costa',
              email: 'ana@example.com',
            },
            messages: [
              {
                id: 3,
                content: 'Gostaria de saber sobre os preços dos planos',
                message_type: 'incoming',
                sender_type: 'contact',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                sender: {
                  id: 2,
                  name: 'Ana Costa',
                }
              }
            ],
            labels: [
              {
                id: 2,
                title: 'Vendas',
                color: '#10B981'
              }
            ],
            messages_count: 1,
            last_message: {
              id: 3,
              content: 'Gostaria de saber sobre os preços dos planos',
              created_at: new Date(Date.now() - 3600000).toISOString(),
            }
          }
        ];

        return mockConversations;
      } catch (error) {
        console.error('Erro ao buscar conversas com mensagens:', error);
        return [];
      }
    },
    enabled: !!authUser,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};