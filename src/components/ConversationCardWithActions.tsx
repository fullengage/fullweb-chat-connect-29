import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MessageCircle, 
  Clock, 
  User, 
  ArrowRight, 
  Pause, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"
import { useConversationLabels } from "@/hooks/useLabels"
import { useToast } from "@/hooks/use-toast"

interface ConversationCardWithActionsProps {
  conversation: Conversation
  agents: any[]
  onStatusChange: (conversationId: number, newStatus: string) => Promise<void>
  onAssignAgent: (conversationId: number, agentId: number | null) => Promise<void>
  onClick?: () => void
  isLoading?: boolean
}

export const ConversationCardWithActions = ({ 
  conversation, 
  agents,
  onStatusChange,
  onAssignAgent,
  onClick,
  isLoading = false
}: ConversationCardWithActionsProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false)
  const { toast } = useToast()

  // Buscar etiquetas da conversa
  const { data: conversationLabels = [] } = useConversationLabels(
    conversation.id, 
    conversation.account_id || 1
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta'
      case 'pending':
        return 'Pendente'
      case 'resolved':
        return 'Resolvida'
      default:
        return status
    }
  }

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'Channel::WebWidget':
      case 'webchat':
        return '💬'
      case 'Channel::Email':
      case 'email':
        return '📧'
      case 'Channel::FacebookPage':
        return '📘'
      case 'Channel::TwitterProfile':
        return '🐦'
      case 'Channel::TwilioSms':
        return '📱'
      default:
        return '💬'
    }
  }

  // ✅ ARQUITETURA CORRETA: Mudança de status salva automaticamente no Chatwoot
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === conversation.status) return
    
    setIsUpdatingStatus(true)
    try {
      await onStatusChange(conversation.id, newStatus)
      toast({
        title: "Status atualizado",
        description: `Conversa marcada como ${getStatusText(newStatus)}`,
        variant: "default",
      })
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error)
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da conversa",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // ✅ ARQUITETURA CORRETA: Atribuição de agente salva automaticamente no Chatwoot
  const handleAgentChange = async (agentId: string) => {
    const newAgentId = agentId === "unassign" ? null : parseInt(agentId)
    
    setIsUpdatingAgent(true)
    try {
      await onAssignAgent(conversation.id, newAgentId)
      toast({
        title: newAgentId ? "Agente atribuído" : "Agente removido",
        description: newAgentId 
          ? `Conversa atribuída ao agente ${agents.find(a => a.id === newAgentId)?.name}`
          : "Conversa não está mais atribuída a nenhum agente",
        variant: "default",
      })
    } catch (error) {
      console.error('❌ Erro ao atribuir agente:', error)
      toast({
        title: "Erro na atribuição",
        description: "Não foi possível atribuir o agente à conversa",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingAgent(false)
    }
  }

  const getQuickActionButtons = () => {
    const buttons = []
    
    if (conversation.status === 'open') {
      buttons.push(
        <Button
          key="to-pending"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            handleStatusChange('pending')
          }}
          disabled={isUpdatingStatus || isLoading}
          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
        >
          {isUpdatingStatus ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">Pendente</span>
        </Button>
      )
      buttons.push(
        <Button
          key="to-resolved"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            handleStatusChange('resolved')
          }}
          disabled={isUpdatingStatus || isLoading}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          {isUpdatingStatus ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">Resolver</span>
        </Button>
      )
    }
    
    if (conversation.status === 'pending') {
      buttons.push(
        <Button
          key="to-open"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            handleStatusChange('open')
          }}
          disabled={isUpdatingStatus || isLoading}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          {isUpdatingStatus ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ArrowRight className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">Reabrir</span>
        </Button>
      )
      buttons.push(
        <Button
          key="to-resolved"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            handleStatusChange('resolved')
          }}
          disabled={isUpdatingStatus || isLoading}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          {isUpdatingStatus ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">Resolver</span>
        </Button>
      )
    }
    
    if (conversation.status === 'resolved') {
      buttons.push(
        <Button
          key="to-open"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            handleStatusChange('open')
          }}
          disabled={isUpdatingStatus || isLoading}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          {isUpdatingStatus ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ArrowRight className="h-3 w-3" />
          )}
          <span className="ml-1 text-xs">Reabrir</span>
        </Button>
      )
    }
    
    return buttons
  }

  const lastMessage = conversation.messages?.[conversation.messages.length - 1]

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: conversation.status === 'open' ? '#10b981' : conversation.status === 'pending' ? '#f59e0b' : '#3b82f6' }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.contact?.avatar_url} />
              <AvatarFallback>
                {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold truncate">
                  {conversation.contact?.name || 'Contato Desconhecido'}
                </h3>
                <div className="flex items-center space-x-2">
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                  <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                    {getStatusText(conversation.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs">{getChannelIcon(conversation.inbox.channel_type)}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {conversation.inbox.name}
                </span>
              </div>

              {lastMessage && (
                <p className="text-sm text-foreground mt-2 line-clamp-2">
                  {lastMessage.content || 'Nenhum conteúdo da mensagem'}
                </p>
              )}

              {/* Exibir etiquetas da conversa */}
              {conversationLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {conversationLabels.slice(0, 3).map((label) => (
                    <Badge 
                      key={`conversation-label-${label.id}`} 
                      variant="outline" 
                      className="text-xs px-2 py-0.5"
                      style={{ 
                        borderColor: label.color,
                        color: label.color
                      }}
                    >
                      {label.title}
                    </Badge>
                  ))}
                  {conversationLabels.length > 3 && (
                    <Badge key="conversation-label-more" variant="outline" className="text-xs px-2 py-0.5 text-gray-500">
                      +{conversationLabels.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Seção de Ações Rápidas */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {/* Atribuição de Agente com Salvamento Automático */}
                  <Select
                    value={conversation.assignee?.id?.toString() || "unassign"}
                    onValueChange={handleAgentChange}
                    disabled={isUpdatingAgent || isLoading}
                  >
                    <SelectTrigger 
                      className="h-7 text-xs w-32"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="Agente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassign">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span>Livre</span>
                        </div>
                      </SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-green-600" />
                            <span>{agent.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Botões de Mudança Rápida de Status */}
                  <div className="flex items-center space-x-1">
                    {getQuickActionButtons()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {conversation.updated_at ? (() => {
                      const date = new Date(conversation.updated_at)
                      if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
                        return 'agora'
                      }
                      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
                    })() : 'agora'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}