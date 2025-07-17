
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, User, GripVertical, AlertCircle, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { ConversationForStats } from "@/types"
import { useConversationLabels } from "@/hooks/useLabels"

interface KanbanCardProps {
  id: string
  conversation: ConversationForStats
  onClick?: () => void
  isDragging?: boolean
}

export const KanbanCard = ({ id, conversation, onClick, isDragging }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

  const getPriorityIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-3 w-3 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-3 w-3 text-yellow-600" />
      case 'resolved':
        return <CheckCircle2 className="h-3 w-3 text-blue-600" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const lastMessage = conversation.messages?.[conversation.messages.length - 1]

  // Buscar etiquetas da conversa
  const { data: conversationLabels = [] } = useConversationLabels(conversation.id, conversation.account_id || 1)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all duration-200 bg-white border hover:shadow-md group ${
        isSortableDragging || isDragging 
          ? 'shadow-xl ring-2 ring-blue-400 z-50 rotate-2' 
          : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
              <AvatarImage src={conversation.contact.avatar_url} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {conversation.contact.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate text-gray-900">
                {conversation.contact.name || 'Contato Desconhecido'}
              </h4>
              <div className="flex items-center space-x-1">
                <span className="text-xs">{getChannelIcon(conversation.inbox.channel_type)}</span>
                <span className="text-xs text-gray-500 truncate">
                  {conversation.inbox.name}
                </span>
                {getPriorityIcon(conversation.status)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {conversation.unread_count > 0 && (
              <Badge variant="destructive" className="text-xs h-5 animate-pulse">
                {conversation.unread_count}
              </Badge>
            )}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>

        {lastMessage && (
          <div className="mb-3">
            <p className="text-xs text-foreground line-clamp-2 bg-transparent p-0 rounded">
              {lastMessage.content || 'Nenhum conteúdo da mensagem'}
            </p>
          </div>
        )}

        {/* Exibir etiquetas da conversa */}
        {conversationLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {conversationLabels.slice(0, 3).map((label) => (
              <Badge 
                key={`kanban-label-${label.id}`} 
                variant="outline" 
                className="text-xs px-1.5 py-0.5 h-5"
                style={{ 
                  borderColor: label.color,
                  color: label.color,
                  fontSize: '10px'
                }}
              >
                {label.title}
              </Badge>
            ))}
            {conversationLabels.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 text-gray-500">
                +{conversationLabels.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {conversation.assignee ? (
              <div className="flex items-center space-x-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={conversation.assignee.avatar_url} />
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {conversation.assignee.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500 truncate max-w-20">
                  {conversation.assignee.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">Não atribuído</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {conversation.updated_at ? (() => {
                const date = new Date(conversation.updated_at)
                // Se a data for inválida ou muito antiga (antes de 2000), usar data atual
                if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
                  return 'agora'
                }
                return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
              })() : 'agora'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
