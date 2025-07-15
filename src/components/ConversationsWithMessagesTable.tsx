import { useState } from "react"
import { ConversationWithMessages } from "@/hooks/useConversationsWithMessages"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, User, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ConversationsWithMessagesTableProps {
  conversations: ConversationWithMessages[]
  isLoading: boolean
  totalCount: number
  currentPage: number
  hasMore: boolean
  onPageChange: (page: number) => void
}

export function ConversationsWithMessagesTable({
  conversations,
  isLoading,
  totalCount,
  currentPage,
  hasMore,
  onPageChange
}: ConversationsWithMessagesTableProps) {
  const [expandedConversations, setExpandedConversations] = useState<Set<number>>(new Set())

  const toggleExpanded = (conversationId: number) => {
    const newExpanded = new Set(expandedConversations)
    if (newExpanded.has(conversationId)) {
      newExpanded.delete(conversationId)
    } else {
      newExpanded.add(conversationId)
    }
    setExpandedConversations(newExpanded)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'resolved':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!conversations.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma conversa encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Não há conversas que correspondam aos filtros selecionados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversas com Mensagens</span>
            <Badge variant="secondary">
              {totalCount} conversa{totalCount !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {conversations.map((conversation) => {
              const isExpanded = expandedConversations.has(conversation.id)
              
              return (
                <div key={conversation.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.contact?.avatar_url} />
                        <AvatarFallback>
                          {conversation.contact?.name?.[0]?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.contact?.name || 'Contato sem nome'}
                          </h4>
                          <Badge variant={getStatusBadgeVariant(conversation.status)}>
                            {getStatusLabel(conversation.status)}
                          </Badge>
                          {conversation.priority && (
                            <Badge variant="outline" className="text-xs">
                              {conversation.priority}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          {conversation.contact?.email && (
                            <span>{conversation.contact.email}</span>
                          )}
                          {conversation.contact?.phone && (
                            <span>{conversation.contact.phone}</span>
                          )}
                        </div>

                        {conversation.assignee && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600 mb-2">
                            <User className="h-3 w-3" />
                            <span>Responsável: {conversation.assignee.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{conversation.messages_count} mensagens</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(conversation.last_activity_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {conversation.last_message && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Última mensagem: </span>
                            <span>{conversation.last_message.content?.substring(0, 100)}...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(conversation.id)}
                      className="ml-2"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {isExpanded && conversation.messages.length > 0 && (
                    <div className="mt-4 pl-14">
                      <Separator className="mb-4" />
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <h5 className="text-sm font-semibold text-gray-900">
                          Mensagens ({conversation.messages.length})
                        </h5>
                        {conversation.messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`p-3 rounded-lg text-sm ${
                              message.sender_type === 'agent' 
                                ? 'bg-blue-50 border-l-4 border-blue-200' 
                                : 'bg-gray-50 border-l-4 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-600">
                                {message.sender_type === 'agent' ? 'Agente' : 
                                 message.sender_type === 'contact' ? 'Contato' : 'Sistema'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(message.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700">
                              {message.content || '[Sem conteúdo]'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Página {currentPage} - Mostrando {conversations.length} de {totalCount} conversas
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasMore}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}