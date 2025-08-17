import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const shortcuts: Record<string, string> = {
  'd': '/dashboard',
  'v': '/videos', 
  'a': '/analytics',
  'g': '/ai-generate',
  's': '/brain-search',
  'i': '/content-ideas',
  'z': '/viral-analyzer',
  'c': '/context',
  ',': '/settings'
};

export const useKeyboardShortcuts = (onShowHelp?: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in an input/textarea/contenteditable
      const target = event.target as HTMLElement;
      const isInputElement = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.contentEditable === 'true' ||
                           target.closest('[role="textbox"]');
      
      if (isInputElement) return;

      // Handle help shortcut (?)
      if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        if (onShowHelp) onShowHelp();
        return;
      }

      // Handle Cmd+K or Ctrl+K for search (future feature)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        // TODO: Open command palette when implemented
        console.log('Command palette shortcut triggered');
        return;
      }

      // Handle navigation shortcuts (Alt + key)
      if (event.altKey && !event.metaKey && !event.ctrlKey) {
        const key = event.key.toLowerCase();
        const route = shortcuts[key];
        
        if (route) {
          event.preventDefault();
          navigate(route);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return { shortcuts };
};