import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'supervisor' | 'administrator';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Inbox {
  id: string;
  name: string;
  channel_type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Hook para buscar usuários
export const useUsers = (accountId?: number) => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['users', authUser?.id, accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as User[];
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook para buscar conversas (usando dados do Supabase como fallback)
export const useConversations = () => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['supabase-conversations', authUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!authUser,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook para buscar inboxes
export const useInboxes = (accountId?: number) => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['inboxes', authUser?.id, accountId],
    queryFn: async () => {
      // Return mock data since inboxes table doesn't exist in Supabase
      const mockInboxes: Inbox[] = [
        {
          id: '1',
          name: 'WhatsApp',
          channel_type: 'whatsapp',
          description: 'Canal principal WhatsApp',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Email',
          channel_type: 'email',
          description: 'Canal de email',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      return mockInboxes;
    },
    enabled: !!authUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook para buscar contatos
export const useContacts = (accountId?: number) => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['contacts', authUser?.id, accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('account_id', accountId || 1)
        .order('name');

      if (error) throw error;
      
      // Convert to expected format
      const contacts = data.map(contact => ({
        id: contact.id.toString(),
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        avatar_url: contact.avatar_url,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
      }));
      
      return contacts as Contact[];
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};