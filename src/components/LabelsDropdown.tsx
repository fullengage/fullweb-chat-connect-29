import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tag, Plus, Check } from "lucide-react";
import { Conversation } from "@/types";
import { 
  useLabels, 
  useConversationLabels, 
  useAddLabelToConversation, 
  useRemoveLabelFromConversation,
  useCreateLabel 
} from "@/hooks/useLabels";

interface LabelsDropdownProps {
  conversation: Conversation;
  accountId: number;
}

export const LabelsDropdown = ({ conversation, accountId }: LabelsDropdownProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLabelTitle, setNewLabelTitle] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");
  const [newLabelDescription, setNewLabelDescription] = useState("");

  // Hooks para gerenciar etiquetas
  const { data: allLabels = [], isLoading: labelsLoading } = useLabels(accountId);
  const { data: conversationLabels = [], isLoading: conversationLabelsLoading } = useConversationLabels(conversation.id, accountId);
  const addLabelMutation = useAddLabelToConversation();
  const removeLabelMutation = useRemoveLabelFromConversation();
  const createLabelMutation = useCreateLabel();

  // IDs das etiquetas já aplicadas à conversa
  const appliedLabelIds = conversationLabels.map(label => label.id);

  const handleAddLabel = async (labelId: number) => {
    if (appliedLabelIds.includes(labelId)) return;
    
    await addLabelMutation.mutateAsync({
      conversationId: conversation.id,
      labelId,
      accountId
    });
  };

  const handleRemoveLabel = async (labelId: number) => {
    await removeLabelMutation.mutateAsync({
      conversationId: conversation.id,
      labelId,
      accountId
    });
  };

  const handleCreateLabel = async () => {
    if (!newLabelTitle.trim()) return;

    try {
      await createLabelMutation.mutateAsync({
        title: newLabelTitle.trim(),
        color: newLabelColor,
        description: newLabelDescription.trim() || undefined,
        accountId
      });

      // Limpar formulário
      setNewLabelTitle("");
      setNewLabelColor("#3B82F6");
      setNewLabelDescription("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error);
    }
  };

  const isLoading = labelsLoading || conversationLabelsLoading;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <Tag className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm font-medium">
          Etiquetas da Conversa
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Carregando etiquetas...
          </div>
        ) : (
          <>
            {allLabels.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                Nenhuma etiqueta disponível
              </div>
            ) : (
              allLabels.map((label) => {
                const isApplied = appliedLabelIds.includes(label.id);
                
                return (
                  <DropdownMenuItem
                    key={label.id}
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      if (isApplied) {
                        handleRemoveLabel(label.id);
                      } else {
                        handleAddLabel(label.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm">{label.title}</span>
                    </div>
                    {isApplied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </DropdownMenuItem>
                );
              })
            )}
            
            <DropdownMenuSeparator />
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar Nova Etiqueta</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Etiqueta</DialogTitle>
                  <DialogDescription>
                    Crie uma nova etiqueta para organizar suas conversas.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Título
                    </Label>
                    <Input
                      id="title"
                      value={newLabelTitle}
                      onChange={(e) => setNewLabelTitle(e.target.value)}
                      className="col-span-3"
                      placeholder="Nome da etiqueta"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">
                      Cor
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <input
                        type="color"
                        id="color"
                        value={newLabelColor}
                        onChange={(e) => setNewLabelColor(e.target.value)}
                        className="w-12 h-8 rounded border cursor-pointer"
                      />
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: newLabelColor, 
                          color: newLabelColor 
                        }}
                      >
                        {newLabelTitle || "Preview"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descrição
                    </Label>
                    <Input
                      id="description"
                      value={newLabelDescription}
                      onChange={(e) => setNewLabelDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="Descrição opcional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateLabel}
                    disabled={!newLabelTitle.trim() || createLabelMutation.isPending}
                  >
                    {createLabelMutation.isPending ? "Criando..." : "Criar Etiqueta"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};