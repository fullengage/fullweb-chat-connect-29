import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface DifyBot {
  id: string;
  name: string;
  description?: string;
  api_key: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Função para verificar se há API key configurada
export const hasApiKey = (): boolean => {
  const apiKey = localStorage.getItem('dify_api_key');
  return !!apiKey && apiKey.length > 0;
};

// Função para obter a API key
export const getApiKey = (): string | null => {
  return localStorage.getItem('dify_api_key');
};

// Função para definir a API key
export const setApiKey = (apiKey: string): void => {
  localStorage.setItem('dify_api_key', apiKey);
};

// Hook para buscar bots do Dify
export const useDifyBots = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['dify-bots'],
    queryFn: async () => {
      const apiKey = getApiKey();
      
      if (!apiKey) {
        throw new Error('API key do Dify não configurada');
      }

      // Simulando dados de bots por enquanto
      // Em uma implementação real, você faria uma chamada para a API do Dify
      const mockBots: DifyBot[] = [
        {
          id: '1',
          name: 'Assistente de Vendas',
          description: 'Bot especializado em vendas e suporte comercial',
          api_key: apiKey,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Suporte Técnico',
          description: 'Bot para questões técnicas e troubleshooting',
          api_key: apiKey,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      return mockBots;
    },
    enabled: hasApiKey(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook para enviar mensagem para um bot do Dify
export const useSendToDifyBot = () => {
  const { toast } = useToast();

  const sendMessage = async (botId: string, message: string) => {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('API key do Dify não configurada');
    }

    try {
      // Aqui você implementaria a chamada real para a API do Dify
      // Por enquanto, retornamos uma resposta simulada
      const response = {
        id: Date.now().toString(),
        message: `Resposta simulada do bot ${botId} para: "${message}"`,
        timestamp: new Date().toISOString(),
      };

      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada para o bot com sucesso",
      });

      return response;
    } catch (error) {
      console.error('Erro ao enviar mensagem para o bot:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem para o bot",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { sendMessage };
};