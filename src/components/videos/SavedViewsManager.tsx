import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSavedViews } from '@/hooks/useSavedViews';
import { VideoFilters, SortOption } from '@/types/videos';
import { 
  Bookmark, 
  Play, 
  Trash2, 
  Edit, 
  Check, 
  X,
  Plus 
} from 'lucide-react';

interface SavedViewsManagerProps {
  onLoadView: (filters: VideoFilters, sort: SortOption, normalize: boolean) => void;
}

export const SavedViewsManager = ({ onLoadView }: SavedViewsManagerProps) => {
  const { savedViews, loading, deleteView, renameView } = useSavedViews();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleLoadView = (view: any) => {
    onLoadView(view.filters, view.sort_by, view.normalize_by_1k);
  };

  const handleStartEdit = (view: any) => {
    setEditingId(view.id);
    setEditingName(view.name);
  };

  const handleSaveEdit = async () => {
    if (editingId && editingName.trim()) {
      await renameView(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <Bookmark className="w-4 h-4" />
            Vistas guardadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-text-primary">
          <Bookmark className="w-4 h-4" />
          Vistas guardadas
          {savedViews.length > 0 && (
            <Badge variant="outline" className="ml-auto">
              {savedViews.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {savedViews.length === 0 ? (
          <div className="text-center py-6">
            <Plus className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">
              No tienes vistas guardadas aún
            </p>
            <p className="text-xs text-text-muted mt-1">
              Aplica filtros y guarda tu primera vista
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {savedViews.map((view) => (
                <div
                  key={view.id}
                  className="group flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {editingId === view.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveEdit}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadView(view)}
                        className="flex-1 justify-start h-8 px-2 text-left"
                      >
                        <Play className="w-3 h-3 mr-2 shrink-0" />
                        <span className="truncate text-sm">{view.name}</span>
                      </Button>
                      
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(view)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteView(view.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};