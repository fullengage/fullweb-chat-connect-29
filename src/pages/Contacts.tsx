
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Users, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactStats } from "@/components/ContactStats";
import { ContactsList } from "@/components/ContactsList";
import { NewContactDialog } from "@/components/NewContactDialog";
import { useChatwootContacts, useCreateChatwootContact } from "@/hooks/useChatwootContacts";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountId] = useState("1");
  const { toast } = useToast();

  // Usar o hook do proxy do Chatwoot
  const { data: contacts = [], loading: contactsLoading, error: contactsError, refresh } = useChatwootContacts(accountId);
  const createContactMutation = useCreateChatwootContact();

  const handleContactAdded = async (newContactData: any) => {
    try {
      await createContactMutation.mutateAsync({
        ...newContactData,
        account_id: accountId
      });
      
      // Atualizar a lista após criar contato
      refresh();
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleContactUpdate = () => {
    refresh();
  };

  const handleRefresh = () => {
    refresh();
    toast({
      title: "Atualizando dados",
      description: "Buscando os contatos mais recentes...",
    });
  };

  if (contactsError) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar contatos</h2>
                <p className="text-gray-600">Não foi possível carregar os dados dos contatos.</p>
                <Button onClick={handleRefresh} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
                    <p className="text-gray-600">Gerencie seus clientes e contatos</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={handleRefresh} disabled={contactsLoading} variant="outline">
                  <RefreshCw className={`h-4 w-4 mr-2 ${contactsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <NewContactDialog onContactAdded={handleContactAdded} />
              </div>
            </div>

            {/* Stats Cards */}
            <ContactStats />

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Contacts List */}
            <ContactsList 
              searchTerm={searchTerm} 
              tagFilter="all"
              contacts={contacts.map(c => ({
                id: c.id.toString(),
                name: c.name,
                email: c.email,
                phone: c.phone,
                created_at: c.created_at
              }))}
              onContactUpdate={handleContactUpdate}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Contacts;
