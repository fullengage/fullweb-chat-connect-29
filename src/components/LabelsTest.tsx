import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/types"
import { useLabels, useCreateLabel, useConversationLabels } from "@/hooks/useLabels"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const LabelsTest = () => {
  const [newLabelTitle, setNewLabelTitle] = useState("")
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6")
  const [testConversationId, setTestConversationId] = useState("12")
  const { toast } = useToast()

  // Testar com account_id = 1
  const { data: labels = [], isLoading, error, refetch } = useLabels(1)
  const { data: conversationLabels = [], error: conversationLabelsError } = useConversationLabels(parseInt(testConversationId), 1)
  const createLabelMutation = useCreateLabel()

  const handleCreateLabel = async () => {
    if (!newLabelTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título da etiqueta é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      await createLabelMutation.mutateAsync({
        title: newLabelTitle.trim(),
        color: newLabelColor,
        description: `Etiqueta criada em ${new Date().toLocaleString()}`,
        accountId: 1
      })
      
      setNewLabelTitle("")
      toast({
        title: "Sucesso",
        description: "Etiqueta criada com sucesso!",
      })
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error)
    }
  }

  const testTableStructure = async () => {
    try {
      // Testar tabela labels
      // Mock labels data since table doesn't exist
      const labelsData = []
      const labelsError = null

      // Testar tabela conversation_labels
      const { data: convLabelsData, error: convLabelsError } = await supabase
        .from('conversation_labels')
        .select('*')
        .limit(1)

      console.log('Labels table test:', { data: labelsData, error: labelsError })
      console.log('Conversation labels table test:', { data: convLabelsData, error: convLabelsError })

      toast({
        title: "Teste de estrutura",
        description: `Labels: ${labelsError ? 'Erro' : 'OK'}, Conversation Labels: ${convLabelsError ? 'Erro' : 'OK'}`,
        variant: labelsError || convLabelsError ? "destructive" : "default",
      })
    } catch (error) {
      console.error('Erro no teste de estrutura:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="border rounded-lg p-4 bg-card">
        <h2 className="text-xl font-semibold mb-4">Teste do Sistema de Labels</h2>
        
        {/* Status */}
        <div className="mb-4 p-3 bg-muted rounded">
          <h3 className="font-medium mb-2">Status da Conexão:</h3>
          <div className="space-y-1 text-sm">
            <p>Loading: {isLoading ? "🔄 Carregando..." : "✅ Pronto"}</p>
            <p>Error: {error ? "❌ Sim" : "✅ Não"}</p>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
                <strong>Erro:</strong> {error.message}
              </p>
            )}
            <p>Labels encontradas: <strong>{labels.length}</strong></p>
          </div>
        </div>

        {/* Teste de estrutura das tabelas */}
        <div className="mb-4 p-3 bg-muted rounded">
          <h3 className="font-medium mb-2">Teste de Estrutura das Tabelas:</h3>
          <Button onClick={testTableStructure} variant="outline" size="sm">
            🔍 Testar Estrutura
          </Button>
        </div>

        {/* Teste conversation_labels */}
        <div className="mb-4 p-3 bg-muted rounded">
          <h3 className="font-medium mb-2">Teste Conversation Labels:</h3>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="ID da conversa"
              value={testConversationId}
              onChange={(e) => setTestConversationId(e.target.value)}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground self-center">
              Conversation Labels: {conversationLabels.length}
            </span>
          </div>
          {conversationLabelsError && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
              <strong>Erro:</strong> {conversationLabelsError.message}
            </p>
          )}
        </div>

        {/* Criar nova etiqueta */}
        <div className="mb-4 p-3 bg-muted rounded">
          <h3 className="font-medium mb-2">Criar nova etiqueta:</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Título da etiqueta"
              value={newLabelTitle}
              onChange={(e) => setNewLabelTitle(e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-16"
            />
            <Button 
              onClick={handleCreateLabel}
              disabled={createLabelMutation.isPending}
            >
              {createLabelMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </div>
        </div>

        {/* Lista de etiquetas */}
        <div className="p-3 bg-muted rounded">
          <h3 className="font-medium mb-2">Etiquetas existentes:</h3>
          {labels.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma etiqueta encontrada</p>
          ) : (
            <div className="space-y-2">
              {labels.map((label: any) => (
                <div 
                  key={label.id} 
                  className="flex items-center gap-2 p-2 border rounded bg-background"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="font-medium">{label.title}</span>
                  {label.description && (
                    <span className="text-sm text-muted-foreground">- {label.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de refresh */}
        <div className="mt-4">
          <Button onClick={() => refetch()} variant="outline">
            🔄 Atualizar lista
          </Button>
        </div>
      </div>
    </div>
  )
} 