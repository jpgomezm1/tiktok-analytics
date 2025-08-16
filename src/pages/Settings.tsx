import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FollowersWidget } from '@/components/FollowersWidget';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n';
import { Brain, Key, Clock, Zap, Shield, Save, Users } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const t = useT;
  const [settings, setSettings] = useState({
    aiEnabled: true,
    analysisFrequency: 'weekly',
    autoInsights: true,
    performancePrediction: true,
    contentSuggestions: true,
    weeklyReports: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save settings to localStorage for now
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      
      toast({
        title: t('settings.settingsSaved'),
        description: t('settings.settingsUpdated'),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-text-primary">{t('settings.title')}</h1>
        </div>
        <p className="text-text-secondary">Configura tu análisis de contenido con IA y recomendaciones</p>
      </div>

      <div className="space-y-6">
        {/* Followers History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Users className="w-5 h-5" />
              Historial de seguidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary mb-4">Gestiona tu historial diario de seguidores para métricas más precisas</p>
            <FollowersWidget />
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Key className="w-5 h-5" />
              Claude API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-text-primary">API Key Status</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                    Connected
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Claude API is configured and ready for content analysis
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usage" className="text-text-secondary">API Usage This Month</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-purple-400"></div>
                </div>
                <span className="text-sm text-text-muted">25% used</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Clock className="w-5 h-5" />
              Analysis Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-text-secondary">How often should AI analyze your content?</Label>
              <Select value={settings.analysisFrequency} onValueChange={(value) => handleSettingChange('analysisFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-text-primary">Auto-generate insights</Label>
                <p className="text-sm text-text-muted">Automatically analyze new video performance</p>
              </div>
              <Switch
                checked={settings.autoInsights}
                onCheckedChange={(checked) => handleSettingChange('autoInsights', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-text-primary">Weekly AI reports</Label>
                <p className="text-sm text-text-muted">Receive comprehensive weekly analysis reports</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Zap className="w-5 h-5" />
              AI Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-text-primary">Performance Prediction</Label>
                <p className="text-sm text-text-muted">Predict viral potential before posting</p>
              </div>
              <Switch
                checked={settings.performancePrediction}
                onCheckedChange={(checked) => handleSettingChange('performancePrediction', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-text-primary">Content Suggestions</Label>
                <p className="text-sm text-text-muted">AI-powered content ideas based on your data</p>
              </div>
              <Switch
                checked={settings.contentSuggestions}
                onCheckedChange={(checked) => handleSettingChange('contentSuggestions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-text-primary">Smart Analysis</Label>
                <p className="text-sm text-text-muted">Deep pattern recognition and trend analysis</p>
              </div>
              <Switch
                checked={settings.aiEnabled}
                onCheckedChange={(checked) => handleSettingChange('aiEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;