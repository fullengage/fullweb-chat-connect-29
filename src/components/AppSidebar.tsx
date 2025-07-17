import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bot, BarChart3, MessageSquare, Users, Inbox, Home, Mail, TrendingUp, UsersRound, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Campanhas",
    url: "/campaigns",
    icon: Mail,
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Agentes",
    url: "/agents",
    icon: Inbox,
  },
  {
    title: "Equipes",
    url: "/teams",
    icon: UsersRound,
  },
  {
    title: "Agent Bots",
    url: "/agent-bots",
    icon: Bot,
  },
  {
    title: "Análises Avançadas",
    url: "/analytics",
    icon: TrendingUp,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <div className="p-2 bg-primary rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">CRM Hub</h2>
            <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wider px-4 pt-2 pb-1">Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className={location.pathname === item.url
                      ? "bg-primary/20 text-primary hover:bg-primary/30"
                      : "hover:bg-accent hover:text-accent-foreground transition-colors"
                    }
                  >
                    <Link to={item.url} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © 2025 CRM Hub - Powered by AI
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
