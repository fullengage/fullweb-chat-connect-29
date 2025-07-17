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
export const useUsers = () => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['users', authUser?.id],
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
export const useInboxes = () => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['inboxes', authUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inboxes')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Inbox[];
    },
    enabled: !!authUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook para buscar contatos
export const useContacts = () => {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['contacts', authUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};