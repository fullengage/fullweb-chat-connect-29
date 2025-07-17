import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  RefreshCw, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  MoreVertical
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { ConversationForStats } from "@/types"
import { AgentAssignmentDropdown } from "./AgentAssignmentDropdown"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface ConversationListViewProps {
  conversations: ConversationForStats[]
  agents: Agent[]
  onConversationClick: (conversation: ConversationForStats) => void
  onAssignAgent: (conversationId: number, agentId: number | null) => void
  onStatusChange: (conversationId: number, newStatus: string) => void
  isLoading?: boolean
}

export const ConversationListView = ({
  conversations,
  agents,
  onConversationClick,
  onAssignAgent,
  onStatusChange,
  isLoading = false
}: ConversationListViewProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")

  // Filtrar conversas
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = searchTerm === "" || 
      conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || conversation.status === statusFilter
    
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "unassigned" && !conversation.assignee) ||
      (assigneeFilter !== "unassigned" && conversation.assignee?.id === assigneeFilter)

    return matchesSearch && matchesStatus && matchesAssignee
  })

  // Agrupar por status
  const conversationsByStatus = {
    all: filteredConversations,
    open: filteredConversations.filter(c => c.status === 'open'),
    pending: filteredConversations.filter(c => c.status === 'pending'),
    resolved: filteredConversations.filter(c => c.status === 'resolved'),
  }

  // Estatísticas
  const stats = {
    total: conversations.length,
    unread: conversations.filter(c => c.unread_count > 0).length,
    assigned: conversations.filter(c => c.assignee).length,
    unassigned: conversations.filter(c => !c.assignee).length,
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'resolved':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-3 w-3" />
      case 'pending':
        return <AlertCircle className="h-3 w-3" />
      case 'resolved':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const ConversationItem = ({ conversation }: { conversation: ConversationForStats }) => (
    <div 
      className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
      onClick={() => onConversationClick(conversation)}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.contact.avatar_url} />
          <AvatarFallback className="bg-purple-500 text-white text-sm">
            {conversation.contact.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {conversation.contact.name || 'Contato Desconhecido'}
            </h3>
            {conversation.unread_count > 0 && (
              <Badge variant="destructive" className="text-xs h-5">
                {conversation.unread_count}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(conversation.updated_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Badge 
          className={`text-xs text-white ${getStatusBadgeColor(conversation.status)}`}
        >
          {conversation.status}
        </Badge>
        
        <AgentAssignmentDropdown
          conversation={conversation}
          agents={agents}
          onAssign={onAssignAgent}
        />
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com busca e filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversas</CardTitle>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Abertas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="resolved">Resolvidas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unassigned">Não atribuídos</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{stats.unread}</div>
              <div className="text-xs text-gray-500">Não lidas</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{stats.assigned}</div>
              <div className="text-xs text-gray-500">Atribuídas</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">{stats.unassigned}</div>
              <div className="text-xs text-gray-500">Livres</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de conversas com tabs */}
      <Card>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <CardHeader className="pb-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Todas {conversationsByStatus.all.length}
              </TabsTrigger>
              <TabsTrigger value="open">
                Abertas {conversationsByStatus.open.length}
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes {conversationsByStatus.pending.length}
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolvidas {conversationsByStatus.resolved.length}
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-0">
            <TabsContent value="all" className="mt-0">
              <div className="max-h-96 overflow-y-auto">
                {conversationsByStatus.all.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
                {conversationsByStatus.all.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversa encontrada</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="open" className="mt-0">
              <div className="max-h-96 overflow-y-auto">
                {conversationsByStatus.open.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
                {conversationsByStatus.open.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversa aberta</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="max-h-96 overflow-y-auto">
                {conversationsByStatus.pending.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
                {conversationsByStatus.pending.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversa pendente</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="mt-0">
              <div className="max-h-96 overflow-y-auto">
                {conversationsByStatus.resolved.map((conversation) => (
                  <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
                {conversationsByStatus.resolved.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversa resolvida</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}