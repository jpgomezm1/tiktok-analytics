import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/AppSidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageHeader } from '@/components/PageHeader';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Command } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  useKeyboardShortcuts(() => setShowShortcutsHelp(true));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-lg">
          <div className="w-12 h-12 border-4 border-purple-bright border-t-transparent rounded-full animate-spin mx-auto shadow-glow"></div>
          <p className="text-text-secondary animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between px-xl">
              <SidebarTrigger className="md:hidden hover:bg-muted hover:scale-110 transition-fast transform" />
              
              {/* Keyboard shortcuts hint */}
              <div className="hidden lg:flex items-center gap-3 text-text-muted">
                <div className="flex items-center gap-2">
                  <Command className="w-4 h-4" />
                  <span className="text-xs">Alt + tecla para navegar</span>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Alt + D
                  </Badge>
                </div>
                <KeyboardShortcutsHelp 
                  open={showShortcutsHelp} 
                  onOpenChange={setShowShortcutsHelp} 
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-navy-light/20">
            <div className="p-xl">
              <Breadcrumbs />
              <PageHeader />
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Global Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp 
        open={showShortcutsHelp} 
        onOpenChange={setShowShortcutsHelp}
        trigger={null}
      />
    </SidebarProvider>
  );
}