import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface ConversationWithMessages {
  id: number
  account_id: number
  status: string
  kanban_stage?: string
  priority?: string
  last_activity_at: string
  created_at: string
  updated_at: string
  contact: {
    id: number
    name?: string
    email?: string
    phone?: string
    avatar_url?: string
  }
  assignee?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  messages: Array<{
    id: number
    conversation_id: number
    sender_type: string
    sender_id?: string | null
    content?: string | null
    attachments?: any
    read_at?: string | null
    created_at: string
  }>
  messages_count: number
  last_message?: {
    content?: string
    created_at: string
    sender_type: string
  }
}

interface UseConversationsWithMessagesParams {
  account_id?: number
  page?: number
  limit?: number
  status?: string
  search?: string
}

export const useConversationsWithMessages = ({
  account_id,
  page = 1,
  limit = 20,
  status,
  search
}: UseConversationsWithMessagesParams) => {
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  return useQuery({
    queryKey: ['conversations-with-messages', account_id, page, limit, status, search, authUser?.id],
    queryFn: async (): Promise<{ data: ConversationWithMessages[], total: number, hasMore: boolean }> => {
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Buscar dados do usuário atual
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error('User data error:', userError)
        throw new Error('User data not found')
      }

      // Calcular offset para paginação
      const offset = (page - 1) * limit

      // Construir query base para conversas
      let conversationsQuery = supabase
        .from('conversations')
        .select(`
          id,
          account_id,
          status,
          kanban_stage,
          priority,
          last_activity_at,
          created_at,
          updated_at,
          contact:contacts(
            id,
            name,
            email,
            phone,
            avatar_url
          ),
          assignee:users(
            id,
            name,
            email,
            avatar_url
          )
        `, { count: 'exact' })

      // Aplicar filtros baseados no papel do usuário
      if (userData.role === 'superadmin') {
        if (account_id) {
          conversationsQuery = conversationsQuery.eq('account_id', account_id)
        }
      } else if (userData.role === 'admin') {
        conversationsQuery = conversationsQuery.eq('account_id', userData.account_id)
      } else if (userData.role === 'agent') {
        conversationsQuery = conversationsQuery
          .eq('account_id', userData.account_id)
          .or(`assignee_id.eq.${userData.id},assignee_id.is.null`)
      }

      // Aplicar filtros adicionais
      if (status && status !== 'all') {
        conversationsQuery = conversationsQuery.eq('status', status)
      }

      // Filtro de busca por nome do contato
      if (search) {
        conversationsQuery = conversationsQuery.or(`
          contact.name.ilike.%${search}%,
          contact.email.ilike.%${search}%,
          contact.phone.ilike.%${search}%
        `)
      }

      // Aplicar paginação e ordenação
      conversationsQuery = conversationsQuery
        .order('last_activity_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data: conversations, error: conversationsError, count } = await conversationsQuery

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError)
        toast({
          title: "Erro ao buscar conversas",
          description: conversationsError.message,
          variant: "destructive",
        })
        throw conversationsError
      }

      if (!conversations || conversations.length === 0) {
        return {
          data: [],
          total: count || 0,
          hasMore: false
        }
      }

      // Buscar mensagens para todas as conversas encontradas
      const conversationIds = conversations.map(conv => conv.id)
      
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        toast({
          title: "Erro ao buscar mensagens",
          description: messagesError.message,
          variant: "destructive",
        })
        throw messagesError
      }

      // Agrupar mensagens por conversation_id
      const messagesByConversation = (allMessages || []).reduce((acc, message) => {
        if (!acc[message.conversation_id]) {
          acc[message.conversation_id] = []
        }
        acc[message.conversation_id].push(message)
        return acc
      }, {} as Record<number, typeof allMessages>)

      // Combinar conversas com suas mensagens
      const conversationsWithMessages: ConversationWithMessages[] = conversations.map(conversation => {
        const messages = messagesByConversation[conversation.id] || []
        const lastMessage = messages[messages.length - 1]

        return {
          ...conversation,
          messages,
          messages_count: messages.length,
          last_message: lastMessage ? {
            content: lastMessage.content,
            created_at: lastMessage.created_at,
            sender_type: lastMessage.sender_type
          } : undefined
        }
      })

      return {
        data: conversationsWithMessages,
        total: count || 0,
        hasMore: offset + limit < (count || 0)
      }
    },
    enabled: !!authUser,
    staleTime: 30000, // Cache por 30 segundos
    refetchInterval: 60000, // Refetch a cada 1 minuto
  })
}