import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConversationCard } from "./ConversationCard"
import { ConversationCardWithActions } from "./ConversationCardWithActions"
import { ConversationDetail } from "./ConversationDetail"
import { 
  MessageCircle, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowRight,
  Pause,
  CheckCircle2
} from "lucide-react"
import { Conversation } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ConversationManagementProps {
  conversations: Conversation[]
  agents: any[]
  onAssignAgent: (conversationId: number, agentId: number | null) => Promise<void>
  onStatusChange: (conversationId: number, newStatus: string) => Promise<void>
  isLoading?: boolean
}

// Define Agent type to match what ConversationDetail expects
interface LocalAgent {
  id: number
  name: string
  email: string
}

export const ConversationManagement = ({ 
  conversations = [],
  agents = [],
  onAssignAgent,
  onStatusChange,
  isLoading = false
}: ConversationManagementProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Convert agents to LocalAgent[] format expected by ConversationDetail
  const agentsForFilter: LocalAgent[] = agents.map((agent: any) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email
  }))

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedConversation(null)
  }

  // Filter conversations based on search query and filters
  const filteredConversations = conversations.filter((conversation: Conversation) => {
    const matchesSearch = searchQuery === "" || 
      conversation.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "unassigned" && !conversation.assignee) ||
      (assigneeFilter !== "unassigned" && conversation.assignee?.id === assigneeFilter)

    return matchesSearch && matchesAssignee
  })

  // Group conversations by status
  const conversationsByStatus = {
    open: filteredConversations.filter((c: Conversation) => c.status === 'open'),
    pending: filteredConversations.filter((c: Conversation) => c.status === 'pending'),
    resolved: filteredConversations.filter((c: Conversation) => c.status === 'resolved'),
  }

  const getTabCount = (status: string) => {
    return conversationsByStatus[status as keyof typeof conversationsByStatus]?.length || 0
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Gerenciar Conversas</span>
              <Badge variant="outline">{filteredConversations.length} total</Badge>
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  <SelectItem value="unassigned">Não atribuídos</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Remover botão de atualizar pois não há mais refetch local */}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="open">Abertas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidas</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="space-y-3">
                {filteredConversations.map((conversation) => (
                  <ConversationCardWithActions
                    key={conversation.id}
                    conversation={conversation}
                    agents={agents}
                    onStatusChange={onStatusChange}
                    onAssignAgent={onAssignAgent}
                    onClick={() => handleConversationClick(conversation)}
                    isLoading={isLoading}
                  />
                ))}
                {filteredConversations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa encontrada</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="open">
              <div className="space-y-3">
                {conversationsByStatus.open.map((conversation) => (
                  <ConversationCardWithActions
                    key={conversation.id}
                    conversation={conversation}
                    agents={agents}
                    onStatusChange={onStatusChange}
                    onAssignAgent={onAssignAgent}
                    onClick={() => handleConversationClick(conversation)}
                    isLoading={isLoading}
                  />
                ))}
                {conversationsByStatus.open.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa aberta</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="pending">
              <div className="space-y-3">
                {conversationsByStatus.pending.map((conversation) => (
                  <ConversationCardWithActions
                    key={conversation.id}
                    conversation={conversation}
                    agents={agents}
                    onStatusChange={onStatusChange}
                    onAssignAgent={onAssignAgent}
                    onClick={() => handleConversationClick(conversation)}
                    isLoading={isLoading}
                  />
                ))}
                {conversationsByStatus.pending.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Pause className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa pendente</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="resolved">
              <div className="space-y-3">
                {conversationsByStatus.resolved.map((conversation) => (
                  <ConversationCardWithActions
                    key={conversation.id}
                    conversation={conversation}
                    agents={agents}
                    onStatusChange={onStatusChange}
                    onAssignAgent={onAssignAgent}
                    onClick={() => handleConversationClick(conversation)}
                    isLoading={isLoading}
                  />
                ))}
                {conversationsByStatus.resolved.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa resolvida</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {selectedConversation && (
        <ConversationDetail
          conversation={selectedConversation}
          agents={agentsForFilter}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          accountId={selectedConversation?.account_id?.toString() || "1"}
          onConversationUpdate={() => {
            // Força uma atualização das conversas após envio de mensagem ou mudança de status
            toast({
              title: "Conversa atualizada",
              description: "Recarregue a página para ver as últimas alterações",
            })
          }}
        />
      )}
    </>
  )
}
