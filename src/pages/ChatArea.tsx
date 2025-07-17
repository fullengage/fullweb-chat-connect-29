
import { useState, useEffect, useRef } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatMessages } from "@/components/ChatMessages"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatInput } from "@/components/ChatInput"
import { useChatwootConversations } from "@/hooks/useChatwootProxy"
import { useChatwootConversationMessages } from "@/hooks/useChatwootConversationMessages"
import { useChatwootMessages } from "@/hooks/useChatwootConversationMessages"
import { useChatwootAgents } from "@/hooks/useChatwootAgents"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Conversation } from "@/types"
import { MessageSquare } from "lucide-react"

export default function ChatArea() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [accountId, setAccountId] = useState("1")
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Usar o hook do proxy do Chatwoot
  const { 
    data: chatwootConversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError 
  } = useChatwootConversations({
    account_id: accountId,
    status: "all",
    assignee_id: "all",
    inbox_id: "all",
    team_id: "all",
    labels: [],
    page: 1
  })
  const { 
    data: conversationMessages = [], 
    isLoading: messagesLoading, 
    refetch: refreshMessages 
  } = useChatwootConversationMessages(accountId, selectedConversation?.id || null)
  const { sendMessage, updateConversation, loading: messageLoading } = useChatwootMessages()
  const { 
    data: agents = [], 
    isLoading: agentsLoading 
  } = useChatwootAgents(accountId)

  // Converter dados do Chatwoot para o formato esperado pelos componentes
  const conversationsForComponent: Conversation[] = chatwootConversations.map((conv: any) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count || 0,
    contact: {
      id: conv.contact?.id || conv.meta?.sender?.id || 0,
      name: conv.contact?.name || conv.meta?.sender?.name || conv.sender?.name || 'Contato Desconhecido',
      email: conv.contact?.email || conv.meta?.sender?.email || null,
      phone: conv.contact?.phone_number || conv.meta?.sender?.phone_number || null,
      avatar_url: conv.contact?.avatar_url || conv.meta?.sender?.avatar_url || null,
    },
    assignee: conv.assignee_id ? {
      id: conv.assignee_id,
      name: conv.assignee_name || '',
      avatar_url: conv.assignee_avatar_url || ''
    } : undefined,
    inbox: {
      id: conv.inbox_id || 1,
      name: conv.inbox_name || 'Inbox Padrão',
      channel_type: conv.channel || 'webchat'
    },
    updated_at: conv.updated_at,
    created_at: conv.created_at || conv.updated_at || new Date().toISOString(),
    messages: conv.messages || [],
    account_id: conv.account_id || 1,
    contact_id: conv.contact?.id || conv.meta?.sender?.id || 0,
    kanban_stage: conv.kanban_stage || '',
    last_activity_at: conv.updated_at,
    severity: conv.severity || '',
  }))

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversationMessages])

  // Filter conversations based on search
  const filteredConversations = conversationsForComponent.filter(conversation =>
    conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    try {
      await sendMessage({
        accountId,
        conversationId: selectedConversation.id,
        content: content.trim(),
        messageType: 'outgoing'
      })

      // Atualizar as mensagens imediatamente após envio
      refreshMessages()

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleResolveConversation = async () => {
    if (!selectedConversation) return

    try {
      await updateConversation({
        accountId,
        conversationId: selectedConversation.id,
        status: 'resolved'
      })

      // Update local state
      setSelectedConversation(prev => prev ? { ...prev, status: 'resolved' } : null)
    } catch (error) {
      console.error('Error resolving conversation:', error)
    }
  }

  const handleAssignAgent = async (conversationId: number, agentId: number | null) => {
    try {
      await updateConversation({
        accountId,
        conversationId,
        assigneeId: agentId
      })

      // Atualizar o estado local da conversa selecionada
      if (selectedConversation && selectedConversation.id === conversationId) {
        const assignedAgent = agentId ? agents.find(agent => agent.id === agentId) : null
        setSelectedConversation(prev => prev ? {
          ...prev,
          assignee: assignedAgent ? {
            id: assignedAgent.id.toString(),
            name: assignedAgent.name,
            avatar_url: assignedAgent.thumbnail
          } : undefined
        } : null)
      }

      toast({
        title: agentId ? "Agente atribuído" : "Agente removido",
        description: agentId
          ? `Conversa atribuída ao agente ${agents.find(a => a.id === agentId)?.name}`
          : "Conversa não está mais atribuída a nenhum agente",
      })
    } catch (error) {
      console.error('Error assigning agent:', error)
      toast({
        title: "Erro ao atribuir agente",
        description: "Não foi possível atribuir o agente. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  if (conversationsLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando conversas...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen w-full">
            {/* Chat Sidebar */}
            <div className="w-[370px] min-w-[320px] max-w-sm h-full bg-card rounded-l-2xl shadow-lg flex flex-col border-r border-border">
              <ChatSidebar
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isLoading={conversationsLoading}
              />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-background rounded-r-2xl shadow-lg">
              {selectedConversation ? (
                <>
                  <ChatHeader
                    conversation={selectedConversation}
                    agents={agents}
                    onResolve={handleResolveConversation}
                    onAssignAgent={handleAssignAgent}
                    onMarkAsRead={(conversationId) => {
                      toast({
                        title: "Conversa marcada como lida",
                        description: "Todas as mensagens foram marcadas como lidas",
                      })
                    }}
                    onLabelsUpdate={(conversationId, labels) => {
                      toast({
                        title: "Etiquetas atualizadas",
                        description: `${labels.length} etiqueta(s) aplicada(s) à conversa`,
                      })
                    }}
                  />
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {messagesLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
                        </div>
                      </div>
                    ) : (
                      <ChatMessages
                        conversation={{
                          ...selectedConversation,
                          messages: conversationMessages?.length > 0 ? conversationMessages : selectedConversation.messages || []
                        }}
                        currentUser={authUser}
                        users={[]}
                      />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="border-t border-border bg-card p-4">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      isLoading={messageLoading}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-background">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-accent rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                      <MessageSquare className="h-16 w-16 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Nenhuma mensagem ainda</h3>
                    <p className="text-base text-primary/80">Seja o primeiro a enviar uma mensagem para este cliente!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
