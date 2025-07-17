import { useToast } from "@/hooks/use-toast"

export const useSaveConversationNote = () => {
  const { toast } = useToast()

  const saveNote = async (conversationId: number, note: string, accountId: number) => {
    try {
      // TODO: Implementar salvamento de notas via API do Chatwoot ou sistema próprio
      console.log('Salvando nota:', { conversationId, note, accountId })
      
      // Simular salvamento por enquanto
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Nota salva",
        description: "Sua anotação foi salva com sucesso.",
      })
      return true
    } catch (error) {
      console.error("Erro ao salvar nota:", error)
      toast({
        title: "Erro ao salvar nota",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
      return false
    }
  }

  return { saveNote }
}