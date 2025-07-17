import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export function useUsers(accountId?: number) {
  return useQuery({
    queryKey: ['users', accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('account_id', accountId || 1);

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as User[];
    },
    enabled: !!accountId,
  });
}