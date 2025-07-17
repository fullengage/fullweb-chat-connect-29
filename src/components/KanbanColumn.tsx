
import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
  id: string
  title: string
  count: number
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  children: React.ReactNode
}

export const KanbanColumn = ({
  id,
  title,
  count,
  icon,
  bgColor,
  borderColor,
  children
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <Card
      ref={setNodeRef}
      className={`${bgColor} ${borderColor} border-2 transition-all duration-200 ${isOver ? 'ring-2 ring-blue-400 shadow-lg border-blue-300 scale-105' : ''
        }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-semibold">{title}</span>
          </div>
          <Badge variant="secondary" className={`text-xs ${isOver ? 'bg-blue-100 text-blue-800' : ''}`}>
            {count}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`transition-all duration-200 ${isOver ? 'bg-blue-50/50 rounded-lg p-2' : ''}`}>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
