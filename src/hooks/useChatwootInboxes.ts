import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: string;
  avatar_url?: string;
  website_url?: string;
  welcome_title?: string;
  welcome_tagline?: string;
  enable_auto_assignment: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export function useChatwootInboxes(accountId: string = "1") {
  const [data, setData] = useState<ChatwootInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInboxes = async () => {
    if (!accountId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=inboxes&account_id=${accountId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta da API de inboxes:', result);

      // Extrair dados dos inboxes
      let inboxesData = [];
      if (Array.isArray(result)) {
        inboxesData = result;
      } else if (result.data?.payload) {
        inboxesData = result.data.payload;
      } else if (result.payload) {
        inboxesData = result.payload;
      } else if (result.data) {
        inboxesData = result.data;
      }

      console.log('Inboxes extraídos:', inboxesData);

      setData(inboxesData);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar inboxes:', err);
      setError("Erro ao buscar inboxes do Chatwoot");
      setLoading(false);

      toast({
        title: "Erro ao carregar inboxes",
        description: "Não foi possível carregar os dados dos inboxes.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInboxes();
  }, [accountId]);

  const refresh = () => {
    fetchInboxes();
  };

  return {
    data,
    loading,
    error,
    refresh,
    isLoading: loading
  };
}