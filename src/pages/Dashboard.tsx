import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, MessageSquare, BarChart3, Kanban, Users, Clock, AlertCircle, CheckCircle, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard } from "@/components/KanbanBoard"
import { ConversationForStats, Conversation } from "@/types"
import { useChatwootConversations } from "@/hooks/useChatwootProxy"
import { useUpdateConversationStatus } from "@/hooks/useUpdateConversationStatus"
import { useChatwootMessages } from "@/hooks/useChatwootConversationMessages"
import { useChatwootAgents } from "@/hooks/useChatwootAgents"
import { useChatwootInboxes } from "@/hooks/useChatwootInboxes"

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

  // Main conversations hook
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refreshConversations
  } = useChatwootConversations({
    account_id: accountId,
    status: status,
    assignee_id: assigneeId,
    inbox_id: inboxId,
    team_id: "all",
    labels: [],
    page: 1
  })

  // Agents and inboxes data
  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useChatwootAgents(accountId)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useChatwootInboxes(accountId)

  const updateStatus = useUpdateConversationStatus()
  const { updateConversation } = useChatwootMessages()

  const handleRefresh = () => {
    refreshConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  const handleKanbanStatusChange = async (conversationId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ conversationId, status: newStatus, accountId })
      
      setTimeout(() => {
        refreshConversations()
      }, 800)
      
      toast({
        title: "Status atualizado",
        description: `Conversa movida para ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleAssignAgent = async (conversationId: number, agentId: number | null) => {
    try {
      await updateConversation({
        accountId,
        conversationId,
        assigneeId: agentId
      })

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

  // Quick actions
  const handleBulkResolve = async () => {
    const openConversations = conversations.filter(conv => conv.status === 'open')
    if (openConversations.length === 0) {
      toast({
        title: "Nenhuma conversa aberta",
        description: "Não há conversas abertas para resolver",
      })
      return
    }

    try {
      await Promise.all(
        openConversations.slice(0, 5).map(conv => 
          updateStatus.mutateAsync({ conversationId: conv.id, status: 'resolved', accountId })
        )
      )
      
      setTimeout(() => {
        refreshConversations()
      }, 1000)
      
      toast({
        title: "Conversas resolvidas",
        description: `${Math.min(openConversations.length, 5)} conversas foram resolvidas`,
      })
    } catch (error) {
      toast({
        title: "Erro ao resolver conversas",
        description: "Não foi possível resolver todas as conversas",
        variant: "destructive",
      })
    }
  }

  const handleAssignAllToMe = async () => {
    const unassignedConversations = conversations.filter(conv => !conv.assignee_id)
    if (unassignedConversations.length === 0) {
      toast({
        title: "Nenhuma conversa não atribuída",
        description: "Todas as conversas já estão atribuídas",
      })
      return
    }

    // Assumindo que o primeiro agente é o usuário atual
    const currentAgent = agents[0]
    if (!currentAgent) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar o agente atual",
        variant: "destructive",
      })
      return
    }

    try {
      await Promise.all(
        unassignedConversations.slice(0, 5).map(conv => 
          updateConversation({
            accountId,
            conversationId: conv.id,
            assigneeId: currentAgent.id
          })
        )
      )
      
      setTimeout(() => {
        refreshConversations()
      }, 1000)
      
      toast({
        title: "Conversas atribuídas",
        description: `${Math.min(unassignedConversations.length, 5)} conversas foram atribuídas a você`,
      })
    } catch (error) {
      toast({
        title: "Erro ao atribuir conversas",
        description: "Não foi possível atribuir todas as conversas",
        variant: "destructive",
      })
    }
  }

  // Clean data transformation
  const conversationsForComponent: Conversation[] = conversations.map((conv: any) => ({
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
  }));

  const conversationsForStats: ConversationForStats[] = conversationsForComponent.map((conv) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count ?? 0,
    account_id: conv.account_id,
    contact_id: conv.contact_id,
    kanban_stage: conv.kanban_stage,
    last_activity_at: conv.last_activity_at,
    created_at: conv.created_at,
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

  // Performance metrics
  const totalConversations = conversations.length
  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
  const openConversations = conversations.filter(conv => conv.status === 'open').length
  const resolvedConversations = conversations.filter(conv => conv.status === 'resolved').length
  const unassignedConversations = conversations.filter(conv => !conv.assignee_id).length
  const pendingConversations = conversations.filter(conv => conv.status === 'pending').length

  // Error handling
  if (conversationsError) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Erro ao carregar dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Não foi possível carregar as conversas. Verifique sua conexão e tente novamente.
                    </p>
                    <Button onClick={handleRefresh} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar novamente
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Gerencie suas conversas e monitore performance
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleRefresh} disabled={conversationsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalConversations}</div>
                  <p className="text-xs text-muted-foreground">conversas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abertas</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openConversations}</div>
                  <p className="text-xs text-muted-foreground">aguardando</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingConversations}</div>
                  <p className="text-xs text-muted-foreground">em análise</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resolvedConversations}</div>
                  <p className="text-xs text-muted-foreground">finalizadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Não Atribuídas</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unassignedConversations}</div>
                  <p className="text-xs text-muted-foreground">sem agente</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkResolve}
                disabled={conversationsLoading || openConversations === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolver 5 conversas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAssignAllToMe}
                disabled={conversationsLoading || unassignedConversations === 0}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Atribuir a mim
              </Button>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} não lidas
                </Badge>
              )}
            </div>

            {/* Filters */}
            <div className="bg-card border rounded-lg p-4 mb-6">
              <ChatwootFilters
                status={status}
                assigneeId={assigneeId}
                inboxId={inboxId}
                accountId={accountId}
                onStatusChange={setStatus}
                onAssigneeChange={setAssigneeId}
                onInboxChange={setInboxId}
                onAccountIdChange={setAccountId}
                agents={agentsForFilter}
                inboxes={inboxes}
                isLoading={agentsLoading || inboxesLoading}
              />
            </div>

            {/* Main Content */}
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
                  isLoading={conversationsLoading}
                />
              </TabsContent>

              <TabsContent value="kanban" className="space-y-6">
                <KanbanBoard
                  conversations={conversationsForComponent}
                  agents={agents}
                  onConversationClick={() => {}}
                  onStatusChange={handleKanbanStatusChange}
                  onAssignAgent={handleAssignAgent}
                  isLoading={conversationsLoading}
                />
              </TabsContent>

              <TabsContent value="conversations" className="space-y-6">
                <ConversationManagement
                  conversations={conversationsForComponent}
                  agents={agents}
                  onAssignAgent={handleAssignAgent}
                  onStatusChange={handleKanbanStatusChange}
                  isLoading={conversationsLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}