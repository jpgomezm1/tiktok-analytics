import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFollowers } from '@/hooks/useFollowers';
import { useToast } from '@/hooks/use-toast';
import { Users, Save } from 'lucide-react';

export const FollowersUpdateForm = () => {
  const [value, setValue] = useState('');
  const { upsertToday, loading } = useFollowers();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const count = parseInt(value);
    
    if (isNaN(count)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número válido",
        variant: "destructive"
      });
      return;
    }

    try {
      await upsertToday(count);
      toast({
        title: "¡Éxito!",
        description: "Número de seguidores actualizado correctamente",
      });
      setValue('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el número de seguidores",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          Actualizar Seguidores
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Ingresa el número actual de seguidores para hoy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="number"
            placeholder="Ej: 5088"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min="0"
            className="flex-1"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading || !value}
            className="bg-gradient-primary hover:opacity-90 text-white"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Guardar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};