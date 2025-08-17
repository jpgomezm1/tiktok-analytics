import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, HelpCircle } from 'lucide-react';

const shortcutGroups = [
  {
    title: "Analytics",
    shortcuts: [
      { key: "Alt + D", action: "Dashboard" },
      { key: "Alt + V", action: "Videos" },
      { key: "Alt + A", action: "Analytics" }
    ]
  },
  {
    title: "AI Tools", 
    shortcuts: [
      { key: "Alt + G", action: "AI Generate" },
      { key: "Alt + S", action: "Brain Search" },
      { key: "Alt + I", action: "Content Ideas" },
      { key: "Alt + Z", action: "Analizador Viral" }
    ]
  },
  {
    title: "Configuration",
    shortcuts: [
      { key: "Alt + C", action: "Contexto" },
      { key: "Alt + ,", action: "Settings" }
    ]
  },
  {
    title: "General",
    shortcuts: [
      { key: "Cmd/Ctrl + K", action: "Búsqueda rápida (próximamente)" },
      { key: "?", action: "Mostrar esta ayuda" }
    ]
  }
];

interface KeyboardShortcutsHelpProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const KeyboardShortcutsHelp = ({ 
  open: controlledOpen, 
  onOpenChange, 
  trigger 
}: KeyboardShortcutsHelpProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      {!trigger && (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-muted hover:text-text-secondary transition-fast"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-purple-bright" />
            Atajos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-text-primary mb-3 border-b border-border pb-2">
                {group.title}
              </h3>
              <div className="grid gap-2">
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-text-secondary">{shortcut.action}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-xs text-text-muted bg-muted/30 rounded-lg p-3 border border-border">
            <p className="mb-1">💡 <strong>Tip:</strong> Los atajos funcionan desde cualquier página</p>
            <p>Presiona <Badge variant="outline" className="text-xs mx-1">?</Badge> en cualquier momento para ver esta ayuda</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};