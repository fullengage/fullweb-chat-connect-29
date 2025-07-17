import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Tag, X, Check, Save } from "lucide-react";
import { Conversation } from "@/types";
import { 
  useLabels, 
  useConversationLabels, 
  useAddLabelToConversation, 
  useRemoveLabelFromConversation,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
  Label as ChatwootLabel
} from "@/hooks/useLabels";
import { useToast } from "@/hooks/use-toast";

interface LabelManagerProps {
  conversation: Conversation;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLabelsUpdate?: (conversationId: number, labels: ChatwootLabel[]) => void;
}

export const LabelManager = ({ 
  conversation, 
  isOpen, 
  setIsOpen, 
  onLabelsUpdate 
}: LabelManagerProps) => {
  const [editingLabel, setEditingLabel] = useState<ChatwootLabel | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newLabelTitle, setNewLabelTitle] = useState("");

  // Hooks para gerenciar etiquetas do Chatwoot
  const { data: availableLabels = [], isLoading: labelsLoading } = useLabels(conversation.account_id);
  const { data: conversationLabels = [], isLoading: conversationLoading } = useConversationLabels(conversation.id, conversation.account_id);
  const addLabelMutation = useAddLabelToConversation();
  const removeLabelMutation = useRemoveLabelFromConversation();
  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateLabel();
  const deleteLabelMutation = useDeleteLabel();
  
  const { toast } = useToast();

  // Atualizar callback quando as etiquetas da conversa mudarem
  useEffect(() => {
    if (onLabelsUpdate) {
      onLabelsUpdate(conversation.id, conversationLabels);
    }
  }, [conversationLabels, conversation.id, onLabelsUpdate]);

  // Funções para gerenciar etiquetas
  const handleAddLabel = async (label: ChatwootLabel) => {
    try {
      await addLabelMutation.mutateAsync({
        conversationId: conversation.id,
        labelId: label.id,
        accountId: conversation.account_id
      });
    } catch (error) {
      console.error('Erro ao adicionar etiqueta:', error);
    }
  };

  const handleRemoveLabel = async (labelId: number) => {
    try {
      await removeLabelMutation.mutateAsync({
        conversationId: conversation.id,
        labelId,
        accountId: conversation.account_id
      });
    } catch (error) {
      console.error('Erro ao remover etiqueta:', error);
    }
  };

  const handleCreateNewLabel = async () => {
    if (!newLabelTitle.trim()) return;

    try {
      const newLabel = await createLabelMutation.mutateAsync({
        title: newLabelTitle.trim(),
        color: "#6B7280",
        description: "Etiqueta criada pelo usuário",
        accountId: conversation.account_id
      });

      // Aplicar automaticamente à conversa atual
      await addLabelMutation.mutateAsync({
        conversationId: conversation.id,
        labelId: newLabel.id,
        accountId: conversation.account_id
      });

      // Limpar o campo
      setNewLabelTitle("");
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error);
    }
  };

  const handleEditLabel = (label: ChatwootLabel) => {
    setEditingLabel(label);
    setEditTitle(label.title);
    setEditColor(label.color);
  };

  const handleSaveEdit = async () => {
    if (!editingLabel || !editTitle.trim()) return;

    try {
      await updateLabelMutation.mutateAsync({
        labelId: editingLabel.id,
        title: editTitle.trim(),
        color: editColor,
        accountId: conversation.account_id
      });

      setEditingLabel(null);
      setEditTitle("");
      setEditColor("");
    } catch (error) {
      console.error('Erro ao atualizar etiqueta:', error);
    }
  };

  const handleDeleteLabel = async (label: ChatwootLabel) => {
    if (!confirm(`Tem certeza que deseja excluir a etiqueta "${label.title}"?`)) {
      return;
    }

    try {
      await deleteLabelMutation.mutateAsync({
        labelId: label.id,
        accountId: conversation.account_id
      });
    } catch (error) {
      console.error('Erro ao excluir etiqueta:', error);
    }
  };

  const isLabelApplied = (label: ChatwootLabel) => {
    return conversationLabels.some(cl => cl.id === label.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Etiquetas">
          <Tag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Etiquetas</DialogTitle>
          <DialogDescription>
            Adicione ou remova etiquetas desta conversa
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Etiquetas aplicadas */}
          {conversationLabels.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Etiquetas aplicadas:</h4>
              <div className="flex flex-wrap gap-2">
                {conversationLabels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{ backgroundColor: (label.color || '#6B7280') + '20', color: label.color || '#6B7280' }}
                  >
                    {label.title}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveLabel(label.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Etiquetas disponíveis */}
          <div>
            <h4 className="text-sm font-medium mb-2">Etiquetas disponíveis:</h4>
            <div className="space-y-2">
              {availableLabels.map((label) => (
                <div key={label.id} className="flex items-center gap-2">
                  {editingLabel?.id === label.id ? (
                    // Modo de edição
                    <>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1"
                        placeholder="Nome da etiqueta"
                      />
                      <Input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingLabel(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    // Modo normal
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start"
                        onClick={() => isLabelApplied(label) ? handleRemoveLabel(label.id) : handleAddLabel(label)}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.title}
                        {isLabelApplied(label) && <Check className="h-3 w-3 ml-auto" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditLabel(label)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLabel(label)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Criar nova etiqueta */}
          <div>
            <h4 className="text-sm font-medium mb-2">Criar nova etiqueta:</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da etiqueta"
                value={newLabelTitle}
                onChange={(e) => setNewLabelTitle(e.target.value)}
              />
              <Button
                size="sm"
                onClick={handleCreateNewLabel}
                disabled={!newLabelTitle.trim() || createLabelMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Etiqueta será criada no Chatwoot e aplicada à conversa
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};