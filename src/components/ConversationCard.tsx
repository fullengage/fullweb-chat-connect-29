import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Clock, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"
import { useConversationLabels } from "@/hooks/useLabels"

interface ConversationCardProps {
  conversation: Conversation
  onClick?: () => void
}

export const ConversationCard = ({ conversation, onClick }: ConversationCardProps) => {
  // Buscar etiquetas da conversa (assumindo account_id = 1 por enquanto)
  const { data: conversationLabels = [] } = useConversationLabels(conversation.id, conversation.account_id || 1)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const lastMessage = conversation.messages?.[conversation.messages.length - 1]

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
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
                  {conversationLabels.slice(0, 4).map((label) => (
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
                  {conversationLabels.length > 4 && (
                    <Badge key="conversation-label-more" variant="outline" className="text-xs px-2 py-0.5 text-gray-500">
                      +{conversationLabels.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1">
                  {conversation.assignee ? (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {conversation.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Livre
                      </span>
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
