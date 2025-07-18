import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import { ConversationDetailsDrawer } from "./ConversationDetailsDrawer"
import { Clock, AlertCircle, CheckCircle, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useConversationActions } from "@/hooks/useConversationActions"
import { Conversation } from "@/types"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface KanbanBoardProps {
  conversations: Conversation[]
  onConversationClick: (conversation: Conversation) => void
  onStatusChange?: (conversationId: number, newStatus: string) => Promise<void>
  onAssignAgent?: (conversationId: number, agentId: number | null) => Promise<void>
  agents?: Agent[]
  isLoading?: boolean
  accountId?: string
}

const statusColumns = [
  {
    id: "open",
    title: "Abertas",
    icon: Clock,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    status: "open"
  },
  {
    id: "pending",
    title: "Pendentes", 
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    status: "pending"
  },
  {
    id: "resolved",
    title: "Resolvidas",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    status: "resolved"
  },
  {
    id: "unassigned",
    title: "Não Atribuídas",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    status: "open" // Unassigned conversations keep their current status
  }
]

export const KanbanBoard = ({ 
  conversations, 
  onConversationClick, 
  onStatusChange,
  onAssignAgent,
  agents = [],
  isLoading,
  accountId = "1"
}: KanbanBoardProps) => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()
  
  // ✅ ARQUITETURA CORRETA: Hook dedicado para ações de conversa
  const conversationActions = useConversationActions()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Debug: Log das conversas recebidas
  console.log('🔍 KanbanBoard - Conversas recebidas:', conversations)
  console.log('🔍 KanbanBoard - Total de conversas:', conversations.length)
  console.log('🔍 KanbanBoard - Primeira conversa:', conversations[0])
  console.log('🔍 KanbanBoard - AccountId:', accountId)

  // Organizar conversas por status - Lógica baseada nos dados reais
  console.log('🔍 KanbanBoard - Analisando estrutura dos dados:')
  if (conversations.length > 0) {
    const firstConv = conversations[0]
    console.log('🔍 Primeira conversa:', {
      id: firstConv.id,
      status: firstConv.status,
      assignee_id: firstConv.assignee_id,
      assignee: firstConv.assignee,
      contact_name: firstConv.contact?.name
    })
  }
  
  // Organizar conversas SEM DUPLICIDADE - cada conversa aparece apenas em uma coluna
  const conversationsByStatus = {
    // Conversas não atribuídas (prioridade máxima - aparecem aqui independente do status)
    unassigned: conversations.filter(c => {
      const hasAssigneeId = c.assignee_id && c.assignee_id !== '' && c.assignee_id !== '0' && c.assignee_id !== 'undefined' && c.assignee_id !== 'null'
      const hasAssigneeObj = c.assignee && c.assignee.id && c.assignee.id !== '' && c.assignee.id !== '0'
      const hasNoAssignee = !hasAssigneeId && !hasAssigneeObj
      console.log(`Conversa ${c.id}: unassigned=${hasNoAssignee}, assignee_id="${c.assignee_id}"`)
      return hasNoAssignee
    }),
    
    // Conversas atribuídas organizadas por status
    open: conversations.filter(c => {
      const hasAssigneeId = c.assignee_id && c.assignee_id !== '' && c.assignee_id !== '0' && c.assignee_id !== 'undefined' && c.assignee_id !== 'null'
      const hasAssigneeObj = c.assignee && c.assignee.id && c.assignee.id !== '' && c.assignee.id !== '0'
      const hasAssignee = hasAssigneeId || hasAssigneeObj
      const isOpen = c.status === 'open'
      console.log(`Conversa ${c.id}: open=${isOpen && hasAssignee}, status="${c.status}", hasAssignee=${hasAssignee}`)
      return isOpen && hasAssignee
    }),
    
    pending: conversations.filter(c => {
      const hasAssigneeId = c.assignee_id && c.assignee_id !== '' && c.assignee_id !== '0' && c.assignee_id !== 'undefined' && c.assignee_id !== 'null'
      const hasAssigneeObj = c.assignee && c.assignee.id && c.assignee.id !== '' && c.assignee.id !== '0'
      const hasAssignee = hasAssigneeId || hasAssigneeObj
      const isPending = c.status === 'pending'
      console.log(`Conversa ${c.id}: pending=${isPending && hasAssignee}, status="${c.status}", hasAssignee=${hasAssignee}`)
      return isPending && hasAssignee
    }),
    
    resolved: conversations.filter(c => {
      const hasAssigneeId = c.assignee_id && c.assignee_id !== '' && c.assignee_id !== '0' && c.assignee_id !== 'undefined' && c.assignee_id !== 'null'
      const hasAssigneeObj = c.assignee && c.assignee.id && c.assignee.id !== '' && c.assignee.id !== '0'
      const hasAssignee = hasAssigneeId || hasAssigneeObj
      const isResolved = c.status === 'resolved'
      console.log(`Conversa ${c.id}: resolved=${isResolved && hasAssignee}, status="${c.status}", hasAssignee=${hasAssignee}`)
      return isResolved && hasAssignee
    })
  }

  // Debug: Log da organização por status
  console.log('🔍 KanbanBoard - Conversas por status:', conversationsByStatus)
  console.log('🔍 KanbanBoard - Abertas:', conversationsByStatus.open.length)
  console.log('🔍 KanbanBoard - Pendentes:', conversationsByStatus.pending.length)
  console.log('🔍 KanbanBoard - Resolvidas:', conversationsByStatus.resolved.length)
  console.log('🔍 KanbanBoard - Não atribuídas:', conversationsByStatus.unassigned.length)

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    const conversation = conversations.find(c => c.id.toString() === event.active.id)
    setActiveConversation(conversation || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    setActiveConversation(null)
    
    const { active, over } = event
    
    if (!over) return

    const conversationId = parseInt(active.id.toString())
    const newColumnId = over.id.toString()
    const conversation = conversations.find(c => c.id === conversationId)

    if (!conversation) return

    // Find the column configuration
    const targetColumn = statusColumns.find(col => col.id === newColumnId)
    if (!targetColumn) return

    // Handle unassigned column specially
    if (newColumnId === 'unassigned') {
      toast({
        title: "Conversa não atribuída",
        description: "Para atribuir a conversa, use o menu de ações.",
        variant: "default",
      })
      return
    }

    // Get the actual status to save
    const newStatus = targetColumn.status

    // Validar se a mudança é válida
    if (conversation.status === newStatus) return

    // Aplicar regras de negócio
    if (conversation.status === 'resolved' && newStatus !== 'resolved') {
      toast({
        title: "Operação não permitida",
        description: "Conversas resolvidas não podem ser reabertas via Kanban. Use o menu de ações.",
        variant: "destructive",
      })
      return
    }

    // Permitir mover conversas não atribuídas (removido bloqueio)
    // Conversas podem ser movidas independente de ter assignee

    // ✅ ARQUITETURA CORRETA: Usar hook de ações de conversa
    try {
      console.log(`🔄 Movendo conversa ${conversationId} de ${conversation.status} para ${newStatus}`)
      await conversationActions.updateStatus({
        conversationId,
        status: newStatus as 'open' | 'pending' | 'resolved',
        accountId
      })
      
      // Toast já é mostrado pelo hook
    } catch (error) {
      console.error('❌ Erro ao mover conversa:', error)
      // Toast de erro já é mostrado pelo hook
    }
  }

  // Converter Conversation para ConversationForStats para compatibilidade com KanbanCard
  const convertToConversationForStats = (conv: Conversation) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count || 0,
    account_id: conv.account_id || parseInt(accountId),
    contact_id: conv.contact_id || conv.contact?.id || 0,
    kanban_stage: conv.kanban_stage || conv.status,
    last_activity_at: conv.last_activity_at || conv.updated_at,
    created_at: conv.created_at || conv.updated_at,
    contact: conv.contact || { id: 0, name: 'Contato Desconhecido' },
    assignee: conv.assignee ? {
      id: conv.assignee.id, // Já é string no tipo Conversation
      name: conv.assignee.name,
      avatar_url: conv.assignee.avatar_url
    } : undefined,
    inbox: conv.inbox,
    updated_at: conv.updated_at,
    messages: conv.messages || [],
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div key={column.id} className={`${column.bgColor} ${column.borderColor} border-2 rounded-lg p-4 animate-pulse`}>
            <div className="h-6 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const columnConversations = conversationsByStatus[column.id as keyof typeof conversationsByStatus] || []
          const Icon = column.icon
          
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={columnConversations.length}
              icon={<Icon className={`h-4 w-4 ${column.color}`} />}
              bgColor={column.bgColor}
              borderColor={column.borderColor}
            >
              <SortableContext
                items={columnConversations.map(c => c.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[400px]">
                  {columnConversations.map((conversation) => (
                    <KanbanCard
                      key={conversation.id}
                      id={conversation.id.toString()}
                      conversation={convertToConversationForStats(conversation)}
                      onClick={() => setSelectedConversation(conversation)}
                      isDragging={activeConversation?.id === conversation.id && isDragging}
                    />
                  ))}
                  {columnConversations.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma conversa</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeConversation && (
          <div className="rotate-2 opacity-90 transform scale-105 shadow-lg">
            <KanbanCard
              id={activeConversation.id.toString()}
              conversation={convertToConversationForStats(activeConversation)}
              isDragging
            />
          </div>
        )}
      </DragOverlay>

      {/* Drawer de Detalhes da Conversa */}
      <ConversationDetailsDrawer
        conversation={selectedConversation}
        isOpen={!!selectedConversation}
        onClose={() => setSelectedConversation(null)}
        agents={agents}
        accountId={accountId}
        // ✅ ARQUITETURA CORRETA: Usar hook de ações em vez de props
        conversationActions={conversationActions}
      />
    </DndContext>
  )
}