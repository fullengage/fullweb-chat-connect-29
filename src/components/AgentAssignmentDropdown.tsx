import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, User, Check } from "lucide-react"
import { Conversation } from "@/types"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface AgentAssignmentDropdownProps {
  conversation: Conversation
  agents: Agent[]
  onAssign: (conversationId: number, agentId: number | null) => void
  isLoading?: boolean
}

export const AgentAssignmentDropdown = ({
  conversation,
  agents,
  onAssign,
  isLoading = false
}: AgentAssignmentDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleAssign = (agentId: number | null) => {
    onAssign(conversation.id, agentId)
    setIsOpen(false)
  }

  const currentAssigneeId = conversation.assignee?.id ? parseInt(conversation.assignee.id) : null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-blue-100"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Atribuir Agente</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Opção para não atribuir */}
        <DropdownMenuItem
          onClick={() => handleAssign(null)}
          className="flex items-center space-x-2"
        >
          <User className="h-4 w-4 text-gray-400" />
          <span>Não atribuído</span>
          {!currentAssigneeId && <Check className="h-4 w-4 ml-auto text-green-600" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Lista de agentes */}
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => handleAssign(agent.id)}
            className="flex items-center space-x-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={agent.avatar_url} />
              <AvatarFallback className="text-xs">
                {agent.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{agent.name}</div>
              <div className="text-xs text-gray-500">{agent.email}</div>
            </div>
            {currentAssigneeId === agent.id && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        {agents.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-gray-500">Nenhum agente disponível</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}