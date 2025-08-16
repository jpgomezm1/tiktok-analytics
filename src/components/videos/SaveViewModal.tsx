import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSavedViews } from '@/hooks/useSavedViews';
import { VideoFilters, SortOption } from '@/types/videos';
import { Save, X } from 'lucide-react';

interface SaveViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: VideoFilters;
  sortBy: SortOption;
  normalizeBy1K: boolean;
}

export const SaveViewModal = ({
  isOpen,
  onClose,
  filters,
  sortBy,
  normalizeBy1K
}: SaveViewModalProps) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { saveView } = useSavedViews();

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await saveView(name.trim(), filters, sortBy, normalizeBy1K);
      setName('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  const getFilterSummary = () => {
    const summary = [];
    
    if (filters.theme) summary.push(`Tema: ${filters.theme}`);
    if (filters.cta_type) summary.push(`CTA: ${filters.cta_type}`);
    if (filters.editing_style) summary.push(`Estilo: ${filters.editing_style}`);
    if (filters.hook_type && filters.hook_type !== 'all') {
      const hookLabels = {
        pregunta: 'Pregunta',
        numero: 'Número',
        como: 'Cómo...'
      };
      summary.push(`Hook: ${hookLabels[filters.hook_type as keyof typeof hookLabels]}`);
    }
    if (filters.date_range && filters.date_range !== '30d') {
      summary.push(`Período: ${filters.date_range}`);
    }
    if (normalizeBy1K) summary.push('Normalizado');
    
    return summary;
  };

  const getSortLabel = () => {
    const sortLabels = {
      published_date_desc: 'Fecha (más reciente)',
      saves_per_1k_desc: 'Saves por 1K',
      engagement_rate_desc: 'Engagement Rate',
      speed_2h_desc: 'Velocidad 2h',
      performance_score_desc: 'Performance Score',
      views_desc: 'Vistas',
    };
    return sortLabels[sortBy] || sortBy;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Guardar vista personalizada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="view-name" className="text-text-primary">
              Nombre de la vista
            </Label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Videos con hook pregunta 15-24s"
              className="bg-background border-border"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleSave();
                }
              }}
            />
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-text-muted">Orden:</Label>
              <p className="text-sm text-text-primary">{getSortLabel()}</p>
            </div>

            {getFilterSummary().length > 0 && (
              <div>
                <Label className="text-sm text-text-muted">Filtros aplicados:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {getFilterSummary().map((filter, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {filter}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {getFilterSummary().length === 0 && !normalizeBy1K && (
              <p className="text-sm text-text-muted italic">
                No hay filtros aplicados - se guardará la vista por defecto
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};