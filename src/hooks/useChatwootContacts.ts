import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ChatwootContact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  identifier?: string;
  thumbnail?: string;
  additional_attributes?: {
    [key: string]: any;
  };
  custom_attributes?: {
    [key: string]: any;
  };
  contact_inboxes?: Array<{
    inbox_id: number;
    source_id: string;
  }>;
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
  [key: string]: any;
}

export interface ContactWithStats extends ChatwootContact {
  conversations_count?: number;
  last_conversation_at?: string;
  status?: 'active' | 'inactive';
  tags?: string[];
}

export function useChatwootContacts(accountId: string = "1") {
  const [data, setData] = useState<ContactWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!accountId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=contacts&account_id=${accountId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Resposta da API de contatos:', result);
      
      // Extrair dados dos contatos
      let contactsData = [];
      if (Array.isArray(result)) {
        contactsData = result;
      } else if (result.data?.payload) {
        contactsData = result.data.payload;
      } else if (result.payload) {
        contactsData = result.payload;
      } else if (result.data) {
        contactsData = result.data;
      }
      
      console.log('Contatos extraídos:', contactsData);
      
      // Converter para o formato esperado pelos componentes
      const contactsWithStats: ContactWithStats[] = contactsData.map((contact: ChatwootContact) => ({
        ...contact,
        conversations_count: Math.floor(Math.random() * 10) + 1, // Dados simulados por enquanto
        last_conversation_at: contact.last_activity_at || contact.updated_at,
        status: Math.random() > 0.3 ? 'active' : 'inactive',
        tags: contact.additional_attributes?.tags || [],
        phone: contact.phone_number, // Compatibilidade com componentes existentes
        avatar_url: contact.thumbnail
      }));
      
      setData(contactsWithStats);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar contatos:', err);
      setError("Erro ao buscar contatos do Chatwoot");
      setLoading(false);
      
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar os dados dos contatos.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [accountId]);

  const refresh = () => {
    fetchContacts();
  };

  return { 
    data, 
    loading, 
    error, 
    refresh,
    isLoading: loading 
  };
}

// Hook para criar contato
export function useCreateChatwootContact() {
  const { toast } = useToast();
  
  const mutateAsync = async (contactData: any) => {
    try {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=contacts&account_id=${contactData.account_id || 1}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactData.name,
          email: contactData.email,
          phone_number: contactData.phone || contactData.phone_number,
          identifier: contactData.identifier,
          additional_attributes: contactData.additional_attributes || {},
          custom_attributes: contactData.custom_attributes || {}
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar contato');
      }

      const result = await response.json();
      
      toast({
        title: "Contato criado",
        description: "O contato foi criado com sucesso",
      });

      return result;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      toast({
        title: "Erro ao criar contato",
        description: "Não foi possível criar o contato. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { mutateAsync, isPending: false };
}

// Hook para atualizar contato
export function useUpdateChatwootContact() {
  const { toast } = useToast();
  
  const mutateAsync = async (contactData: any) => {
    try {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=contacts/${contactData.id}&account_id=1`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactData.name,
          email: contactData.email,
          phone_number: contactData.phone || contactData.phone_number,
          identifier: contactData.identifier,
          additional_attributes: contactData.additional_attributes || {},
          custom_attributes: contactData.custom_attributes || {}
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar contato');
      }

      const result = await response.json();
      
      toast({
        title: "Contato atualizado",
        description: "Os dados do contato foram atualizados com sucesso",
      });

      return result;
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      toast({
        title: "Erro ao atualizar contato",
        description: "Não foi possível atualizar o contato. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { mutateAsync, isPending: false };
}