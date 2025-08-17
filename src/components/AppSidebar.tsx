import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlayCircle, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Sparkles,
  Target,
  Search,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const menuGroups = [
  {
    label: "Analytics",
    items: [
      { 
        title: "Dashboard", 
        url: "/dashboard", 
        icon: LayoutDashboard,
        shortcut: "D"
      },
      { 
        title: "Videos", 
        url: "/videos", 
        icon: PlayCircle,
        shortcut: "V"
      },
      { 
        title: "Analytics", 
        url: "/analytics", 
        icon: BarChart3,
        shortcut: "A"
      }
    ]
  },
  {
    label: "AI Tools",
    items: [
      { 
        title: "AI Generate", 
        url: "/ai-generate", 
        icon: Sparkles,
        shortcut: "G"
      },
      { 
        title: "Brain Search", 
        url: "/brain-search", 
        icon: Search,
        shortcut: "S"
      },
      { 
        title: "Content Ideas", 
        url: "/content-ideas", 
        icon: Lightbulb,
        shortcut: "I"
      },
      { 
        title: "Analizador Viral", 
        url: "/viral-analyzer", 
        icon: TrendingUp,
        shortcut: "Z"
      }
    ]
  },
  {
    label: "Configuration",
    items: [
      { 
        title: "Contexto", 
        url: "/context", 
        icon: Target,
        shortcut: "C"
      },
      { 
        title: "Settings", 
        url: "/settings", 
        icon: Settings,
        shortcut: ","
      }
    ]
  }
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar
      className={`${open ? "w-64" : "w-14"} transition-all duration-200`}
      collapsible="icon"
    >
      <SidebarContent className="bg-card border-r border-border">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border">
          {open ? (
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TikTok Analytics
            </h1>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={open ? "text-text-muted text-xs font-semibold uppercase tracking-wide px-3 py-2" : "sr-only"}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={`${
                        isActive(item.url) 
                          ? "bg-purple-bright/10 text-purple-light border-r-2 border-purple-bright shadow-purple" 
                          : "text-text-secondary hover:bg-muted hover:text-text-primary hover:shadow-hover"
                      } transition-smooth group relative`}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-fast" />
                        {open && (
                          <div className="flex items-center justify-between w-full">
                            <span className="group-hover:text-purple-light transition-fast">{item.title}</span>
                            <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 text-xs bg-muted rounded border border-border text-text-muted">
                              {item.shortcut}
                            </kbd>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {groupIndex < menuGroups.length - 1 && open && (
              <div className="mx-3 my-2 h-px bg-border"></div>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User Profile Section */}
      <SidebarFooter className="bg-card border-t border-border p-4">
        {open ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.user_metadata?.display_name || 'User'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Sign Out Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full text-text-secondary border-border hover:bg-destructive hover:text-white hover:border-destructive transition-fast hover:shadow-warning"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {/* Collapsed User Avatar */}
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <User className="w-4 h-4 text-white" />
            </div>
            {/* Collapsed Sign Out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="p-2 text-text-secondary hover:bg-destructive hover:text-white transition-fast hover:scale-110 transform"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}