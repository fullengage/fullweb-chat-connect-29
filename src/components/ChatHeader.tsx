
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Eye } from "lucide-react"
import { Conversation } from "@/types"
import { AgentAssignmentDropdown } from "@/components/AgentAssignmentDropdown"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { LabelsDropdown } from "@/components/LabelsDropdown"
import { useConversationLabels } from "@/hooks/useLabels"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface ChatHeaderProps {
  conversation: Conversation
  agents: Agent[]
  onResolve?: () => void
  onAssignAgent?: (conversationId: number, agentId: number | null) => void
  onMarkAsRead?: (conversationId: number) => void
  onLabelsUpdate?: (conversationId: number, labels: any[]) => void
}

export const ChatHeader = ({
  conversation,
  agents,
  onResolve,
  onAssignAgent,
  onMarkAsRead,
  onLabelsUpdate
}: ChatHeaderProps) => {
  const { toast } = useToast()

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

  const handleMarkAsRead = async () => {
    try {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversation.id}/toggle_status&account_id=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'open'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar como lida')
      }

      if (onMarkAsRead) {
        onMarkAsRead(conversation.id)
      }

      toast({
        title: "Conversa marcada como lida",
        description: "Todas as mensagens foram marcadas como lidas",
      })
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
      toast({
        title: "Erro ao marcar como lida",
        description: "Não foi possível marcar a conversa como lida",
        variant: "destructive",
      })
    }
  }

  const handleEditContact = () => {
    toast({
      title: "Editar contato",
      description: "Funcionalidade em desenvolvimento",
    })
  }

  const handleViewDetails = () => {
    toast({
      title: "Ver detalhes",
      description: "Funcionalidade em desenvolvimento",
    })
  }

  const handleDeleteConversation = async () => {
    if (!confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/chatwoot-proxy.php?endpoint=conversations/${conversation.id}&account_id=1`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir conversa')
      }

      toast({
        title: "Conversa excluída",
        description: "A conversa foi excluída com sucesso",
      })

      // Redirecionar ou atualizar a lista de conversas
      window.location.reload()
    } catch (error) {
      console.error('Erro ao excluir conversa:', error)
      toast({
        title: "Erro ao excluir conversa",
        description: "Não foi possível excluir a conversa",
        variant: "destructive",
      })
    }
  }

  // Buscar etiquetas da conversa
  const { data: conversationLabels = [] } = useConversationLabels(conversation.id, conversation.account_id)

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        {/* Avatar, nome e status */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={conversation.contact?.avatar_url} />
            <AvatarFallback>
              {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate max-w-[180px]">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </h2>
              <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>{getStatusText(conversation.status)}</Badge>
            </div>

            {/* Exibir etiquetas aplicadas */}
            {conversationLabels.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {conversationLabels.map((label) => (
                  <Badge
                    key={`label-${label.id}`}
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
              </div>
            )}
          </div>
        </div>

        {/* Ações do header */}
        <div className="flex items-center gap-2">
          {/* Dropdown de atribuição de agente */}
          <AgentAssignmentDropdown
            conversation={conversation}
            agents={agents}
            onAssign={onAssignAgent || (() => { })}
          />
          {/* Dropdown de etiquetas */}
          <LabelsDropdown conversation={conversation} accountId={conversation.account_id} />
          {/* Botão marcar como lida */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Marcar como lida"
            onClick={handleMarkAsRead}
          >
            <Eye className="h-5 w-5" />
          </Button>
          {/* Menu de ações (3 pontinhos) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mais ações">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditContact}>
                Editar contato
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewDetails}>
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-600">
                Excluir conversa
              </DropdownMenuItem>
              {onResolve && (
                <>
                  <DropdownMenuItem onClick={onResolve}>
                    Resolver conversa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
