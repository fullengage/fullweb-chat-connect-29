import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  Tag,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Save
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"
import { useConversationLabels } from "@/hooks/useLabels"
import { LabelsDropdown } from "@/components/LabelsDropdown"
import { useToast } from "@/hooks/use-toast"
import { useSaveConversationNote } from "@/hooks/useSaveConversationNote"
import { useConversationActions } from "@/hooks/useConversationActions"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface ConversationDetailsDrawerProps {
  conversation: Conversation | null
  isOpen: boolean
  onClose: () => void
  agents: Agent[]
  accountId: string | number
  // ✅ ARQUITETURA CORRETA: Usar hook de ações em vez de props
  conversationActions: ReturnType<typeof useConversationActions>
}

export const ConversationDetailsDrawer = ({
  conversation,
  isOpen,
  onClose,
  agents,
  accountId,
  conversationActions
}: ConversationDetailsDrawerProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [notes, setNotes] = useState("")
  
  const { toast } = useToast()
  const { saveNote } = useSaveConversationNote()

  // Buscar etiquetas da conversa
  const { data: conversationLabels = [] } = useConversationLabels(
    conversation?.id || 0, 
    conversation?.account_id || 1
  )

  if (!conversation) return null

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageSquare className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // ✅ ARQUITETURA CORRETA: Usar hook de ações de conversa
  const handleAssignAgent = async (agentId: string) => {
    if (!conversation) return
    
    try {
      const agentIdNumber = agentId === "unassign" ? null : parseInt(agentId)
      await conversationActions.assignAgent({
        conversationId: conversation.id,
        agentId: agentIdNumber,
        accountId
      })
      setSelectedAgentId("")
    } catch (error) {
      console.error('❌ Erro ao atribuir agente:', error)
    }
  }

  const handleChangeStatus = async (newStatus: string) => {
    if (!conversation || newStatus === conversation.status) return
    
    try {
      await conversationActions.updateStatus({
        conversationId: conversation.id,
        status: newStatus as 'open' | 'pending' | 'resolved',
        accountId
      })
      setSelectedStatus("")
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error)
    }
  }

  const lastMessage = conversation.messages?.[conversation.messages.length - 1]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.contact?.avatar_url} />
              <AvatarFallback>
                {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {conversation.contact?.name || 'Contato Desconhecido'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                  {getStatusIcon(conversation.status)}
                  <span className="ml-1">{getStatusText(conversation.status)}</span>
                </Badge>
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {conversation.unread_count} não lidas
                  </Badge>
                )}
              </div>
            </div>
          </SheetTitle>
          <SheetDescription>
            Detalhes completos da conversa e contato
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Informações do Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações do Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conversation.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{conversation.contact.email}</span>
                </div>
              )}
              {conversation.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{conversation.contact.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{conversation.inbox.name}</span>
                <span className="text-xs text-gray-400">
                  ({conversation.inbox.channel_type})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Última atividade: {conversation.updated_at ? (() => {
                    const date = new Date(conversation.updated_at)
                    if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
                      return 'agora'
                    }
                    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
                  })() : 'agora'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Etiquetas */}
          {conversationLabels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {conversationLabels.map((label, index) => (
                    <Badge
                      key={label.id || `label-${index}`}
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: label.color,
                        color: label.color
                      }}
                    >
                      {label.title}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3">
                  <LabelsDropdown 
                    conversation={conversation} 
                    accountId={conversation.account_id || 1} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Atribuir Agente */}
              <div className="space-y-2">
                <Label>Atribuir Agente</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedAgentId} 
                    onValueChange={(agentId) => {
                      setSelectedAgentId(agentId)
                      // ✅ ARQUITETURA CORRETA: Usar hook de ações
                      handleAssignAgent(agentId)
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um agente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassign">Não atribuído</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={agent.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {agent.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {agent.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => selectedAgentId && handleAssignAgent(selectedAgentId)}
                    disabled={!selectedAgentId || conversationActions.isAssigningAgent}
                    size="sm"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                {conversation.assignee && (
                  <div className="text-sm text-gray-600">
                    Atualmente atribuído a: <strong>{conversation.assignee.name}</strong>
                  </div>
                )}
              </div>

              {/* Alterar Status */}
              <div className="space-y-2">
                <Label>Alterar Status</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedStatus} 
                    onValueChange={(newStatus) => {
                      setSelectedStatus(newStatus)
                      // ✅ ARQUITETURA CORRETA: Usar hook de ações
                      handleChangeStatus(newStatus)
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          Aberta
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          Pendente
                        </div>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Resolvida
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => selectedStatus && handleChangeStatus(selectedStatus)}
                    disabled={!selectedStatus || conversationActions.isUpdatingStatus}
                    size="sm"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Última Mensagem */}
          {lastMessage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Última Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {lastMessage.content || 'Nenhum conteúdo da mensagem'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas Internas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Internas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Adicione notas sobre este contato ou conversa..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <Button 
                size="sm" 
                disabled={!notes.trim()}
                onClick={() => conversation && saveNote(conversation.id, notes, conversation.account_id)}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Nota
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}