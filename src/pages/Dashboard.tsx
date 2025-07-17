import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, MessageSquare, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Kanban } from "lucide-react"
import { ConversationForStats, Conversation } from "@/types"
import { useChatwootConversations } from "@/hooks/useChatwootProxy"

import { useResolvedConversations, useForceResolveConversation } from "@/hooks/useResolvedConversations"
import { useUpdateConversationStatus } from "@/hooks/useUpdateConversationStatus"
import { useChatwootMessages } from "@/hooks/useChatwootConversationMessages"
import { useChatwootAgents } from "@/hooks/useChatwootAgents"
import { useChatwootInboxes } from "@/hooks/useChatwootInboxes"

// Define Agent type locally to match what ChatwootFilters expects
interface LocalAgent {
  id: number
  name: string
  email: string
}

export default function Dashboard() {
  const [accountId, setAccountId] = useState("1")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const accountIdNumber = accountId ? parseInt(accountId) : 1

  // ✅ CORREÇÃO: Hook principal que agora usa filtros corretos do proxy
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refreshConversations
  } = useChatwootConversations({
    account_id: accountId,
    status: status, // ✅ CORRETO: Passa o status selecionado para a API
    assignee_id: assigneeId,
    inbox_id: inboxId,
    team_id: "all",
    labels: [],
    page: 1
  })

  // ✅ MANTER: Hooks específicos para casos especiais
  const {
    data: resolvedConversations = [],
    isLoading: resolvedLoading,
    refetch: refreshResolved
  } = useResolvedConversations(accountId)

  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useChatwootAgents(accountIdNumber)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useChatwootInboxes(accountIdNumber)

  const updateStatus = useUpdateConversationStatus()
  const { updateConversation } = useChatwootMessages()
  const { forceResolve } = useForceResolveConversation()

  const handleRefresh = () => {
    refreshConversations()
    refreshResolved() // ✅ ADICIONAR: Refresh das conversas resolvidas também
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  const handleKanbanStatusChange = async (conversationId: number, newStatus: string) => {
    try {
      console.log(`🔄 Atualizando status da conversa ${conversationId} para ${newStatus}`)
      await updateStatus.mutateAsync({ conversationId, status: newStatus, accountId })

      console.log(`✅ Status atualizado com sucesso, fazendo refresh...`)

      // ✅ CORREÇÃO: Refresh adequado com delay otimizado
      setTimeout(() => {
        refreshConversations()
        refreshResolved()
      }, 800) // Delay otimizado para sincronização

    } catch (error) {
      console.error('❌ Error updating conversation status:', error)
    }
  }

  const handleAssignAgent = async (conversationId: number, agentId: number | null) => {
    try {
      await updateConversation({
        accountId,
        conversationId,
        assigneeId: agentId
      })

      // ✅ CORREÇÃO: Refresh adequado
      setTimeout(() => {
        refreshConversations()
      }, 500)

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

  // ✅ CORREÇÃO: Remover filtro duplicado - a API já retorna dados filtrados
  // O ChatwootFilters já passa os filtros para a API via useChatwootConversations

  // ✅ DEBUG: Log melhorado
  console.log('🔍 Dashboard - Estado atual dos filtros:', { status, assigneeId, inboxId })
  console.log('🔍 Dashboard - Conversas recebidas da API:', conversations?.length || 0)
  console.log('🔍 Dashboard - Conversas diretas da API:', conversations?.length || 0)

  if (status === 'resolved') {
    console.log('🔍 Dashboard - Conversas resolvidas específicas:', resolvedConversations?.length || 0)
  }

  // ✅ CORREÇÃO: Usar dados corretos baseado no status selecionado
  const conversationsToShow = status === 'resolved' && resolvedConversations.length > 0
    ? resolvedConversations
    : conversations;

  console.log('🔍 Dashboard - Conversas finais a exibir:', conversationsToShow?.length || 0)

  // ✅ MANTER: Mapeamento para formato dos componentes
  const conversationsForComponent: Conversation[] = conversationsToShow.map((conv: any) => {
    console.log(`🔍 Dashboard - Mapeando conversa ${conv.id}:`, {
      assignee_id: conv.assignee_id,
      assignee: conv.assignee,
      assignee_name: conv.assignee_name,
      status: conv.status
    })

    return {
      id: conv.id,
      status: conv.status,
      unread_count: conv.unread_count || 0,
      contact: {
        id: conv.contact?.id || conv.meta?.sender?.id || 0,
        name:
          conv.contact?.name ||
          conv.meta?.sender?.name ||
          conv.sender?.name ||
          (conv.messages?.[0]?.sender?.name) ||
          "Contato Desconhecido",
        email: conv.contact?.email || conv.meta?.sender?.email || null,
        phone: conv.contact?.phone_number || conv.meta?.sender?.phone_number || null,
        avatar_url:
          conv.contact?.avatar_url ||
          conv.meta?.sender?.avatar_url ||
          conv.sender?.avatar_url ||
          (conv.messages?.[0]?.sender?.avatar_url) ||
          null,
      },
      assignee_id: conv.assignee_id && conv.assignee_id !== 'undefined' && conv.assignee_id !== 'null' ? conv.assignee_id : undefined,
      assignee: conv.assignee_id && conv.assignee_id !== 'undefined' && conv.assignee_id !== null ? {
        id: conv.assignee_id,
        name: conv.assignee_name || conv.assignee?.name || "",
        avatar_url: conv.assignee_avatar_url || conv.assignee?.avatar_url || ""
      } : undefined,
      inbox: {
        id: conv.inbox_id || 1,
        name: conv.inbox_name || "Inbox Padrão",
        channel_type: conv.channel || "webchat"
      },
      updated_at: conv.updated_at,
      created_at: conv.created_at || conv.updated_at || new Date().toISOString(),
      messages: conv.messages || [],
      account_id: conv.account_id || 1,
      contact_id: conv.contact?.id || conv.meta?.sender?.id || 0,
      kanban_stage: conv.kanban_stage || "",
      last_activity_at: conv.updated_at,
      severity: conv.severity || 0,
    }
  });

  const conversationsForStats: ConversationForStats[] = conversationsForComponent.map((conv) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count ?? 0,
    contact: conv.contact,
    assignee: conv.assignee,
    inbox: conv.inbox,
    updated_at: conv.updated_at,
    messages: conv.messages,
  }));

  const agentsForFilter: LocalAgent[] = agents.map((agent: any) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email
  }))

  // ✅ MANTER: Funções de teste
  const testResolveFirstConversation = async () => {
    if (!conversations.length) {
      toast({
        title: "Nenhuma conversa disponível",
        description: "Não há conversas para testar",
        variant: "destructive",
      })
      return
    }

    const firstConversation = conversations[0]
    console.log(`🧪 Testando resolução da conversa ${firstConversation.id}`)

    try {
      await updateStatus.mutateAsync({
        conversationId: firstConversation.id,
        status: 'resolved',
        accountId
      })

      setTimeout(() => {
        refreshConversations()
        refreshResolved()
      }, 1000)

    } catch (error) {
      console.error('❌ Erro ao testar resolução:', error)
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel de Atendimento ao Cliente</h1>
                  <p className="text-muted-foreground">
                    Gerencie suas conversas em tempo real
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleRefresh} disabled={conversationsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testResolveFirstConversation()}
                  disabled={conversationsLoading || !conversations.length}
                >
                  🧪 Testar Resolver
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!conversations.length) return
                    const firstConv = conversations[0]
                    console.log(`🔧 FORÇANDO resolução da conversa ${firstConv.id}`)
                    try {
                      await forceResolve(firstConv.id, accountId)
                      setTimeout(() => {
                        refreshConversations()
                        refreshResolved()
                      }, 1000)
                    } catch (error) {
                      console.error('❌ Erro ao forçar resolução:', error)
                    }
                  }}
                  disabled={conversationsLoading || !conversations.length}
                >
                  🔧 Forçar Resolver
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    console.log('🔍 DEBUG - Estado atual:')
                    console.log('📊 Status selecionado:', status)
                    console.log('📊 Conversas da API principal:', conversations.length)
                    console.log('📊 Conversas diretas da API:', conversations.length)
                    console.log('📊 Conversas resolvidas (hook específico):', resolvedConversations.length)
                    console.log('📊 Conversas finais exibidas:', conversationsForComponent.length)

                    // Log detalhado dos status
                    const statusCount = conversations.reduce((acc: any, conv: any) => {
                      acc[conv.status] = (acc[conv.status] || 0) + 1
                      return acc
                    }, {})
                    console.log('📊 Contagem por status:', statusCount)
                  }}
                >
                  🔍 Debug Status
                </Button>
              </div>
            </div>

            <div className="bg-card border border-card rounded-xl p-4 mb-6">
              <ChatwootFilters
                status={status}
                assigneeId={assigneeId}
                inboxId={inboxId}
                accountId={accountId}
                onStatusChange={setStatus} // ✅ IMPORTANTE: Isso dispara nova busca na API
                onAssigneeChange={setAssigneeId}
                onInboxChange={setInboxId}
                onAccountIdChange={setAccountId}
                agents={agentsForFilter}
                inboxes={inboxes}
                isLoading={agentsLoading || inboxesLoading}
              />
            </div>

            {accountIdNumber > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Visão Geral</span>
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center space-x-2">
                    <Kanban className="h-4 w-4" />
                    <span>Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger value="conversations" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Conversas</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <ConversationStats
                    conversations={conversationsForStats}
                    accountId={accountId}
                    status={status}
                    inboxId={inboxId}
                    searchQuery=""
                  />
                  <ConversationManagement
                    conversations={conversationsForComponent}
                    agents={agents}
                    onAssignAgent={handleAssignAgent}
                    onStatusChange={handleKanbanStatusChange}
                    isLoading={conversationsLoading || resolvedLoading}
                  />
                </TabsContent>

                <TabsContent value="kanban" className="space-y-6">
                  <KanbanBoard
                    conversations={conversationsForComponent}
                    agents={agents}
                    onStatusChange={handleKanbanStatusChange}
                    onAssignAgent={handleAssignAgent}
                    isLoading={conversationsLoading || resolvedLoading}
                  />
                </TabsContent>

                <TabsContent value="conversations" className="space-y-6">
                  <ConversationManagement
                    conversations={conversationsForComponent}
                    agents={agents}
                    onAssignAgent={handleAssignAgent}
                    onStatusChange={handleKanbanStatusChange}
                    isLoading={conversationsLoading || resolvedLoading}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}