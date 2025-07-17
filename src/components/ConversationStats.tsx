
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Clock, Users, CheckCircle } from "lucide-react"
import { ConversationForStats } from "@/types"
import { useChatwootConversationCounts } from "@/hooks/useChatwootConversationCounts"

interface ConversationStatsProps {
  conversations: ConversationForStats[]
  isLoading?: boolean
  accountId: string
  status?: string
  inboxId?: string
  teamId?: string
  labels?: string[]
  searchQuery?: string
}

export const ConversationStats = ({ 
  conversations, 
  isLoading,
  accountId,
  status = "all",
  inboxId,
  teamId,
  labels,
  searchQuery
}: ConversationStatsProps) => {
  // Usar o hook para obter contagens diretamente da API
  const { data: countsData, isLoading: isCountsLoading } = useChatwootConversationCounts({
    account_id: accountId,
    status: status,
    inbox_id: inboxId,
    team_id: teamId,
    labels: labels,
    q: searchQuery
  });

  // Usar isLoading do componente ou do hook de contagens
  const loading = isLoading || isCountsLoading;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Usar contagens da API quando disponíveis, ou calcular localmente como fallback
  const totalConversations = countsData?.all_count ?? conversations.length
  const openConversations = status === "open" ? totalConversations : conversations.filter(c => c.status === 'open').length
  const pendingConversations = status === "pending" ? totalConversations : conversations.filter(c => c.status === 'pending').length
  const resolvedConversations = status === "resolved" ? totalConversations : conversations.filter(c => c.status === 'resolved').length
  
  // Estas contagens ainda são calculadas localmente pois não vêm diretamente da API
  const unassignedConversations = countsData?.unassigned_count ?? conversations.filter(c => !c.assignee).length
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  const stats = [
    {
      title: "Total de Conversas",
      value: totalConversations,
      icon: MessageCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Abertas",
      value: openConversations,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Pendentes",
      value: pendingConversations,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Resolvidas",
      value: resolvedConversations,
      icon: CheckCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {(unassignedConversations > 0 || totalUnread > 0) && (
        <div className="flex space-x-4">
          {unassignedConversations > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {unassignedConversations} Não Atribuídas
            </Badge>
          )}
          {totalUnread > 0 && (
            <Badge variant="destructive">
              {totalUnread} Mensagens Não Lidas
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
