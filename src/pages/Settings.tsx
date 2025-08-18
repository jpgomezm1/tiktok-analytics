import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, Key, Clock, Zap, Shield, Save, Settings as SettingsIcon, Sparkles, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { toast } = useToast();
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
        title: "💾 Settings saved",
        description: "Your AI analysis preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
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

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'red';
    if (percentage >= 60) return 'yellow';
    return 'green';
  };

  const usagePercentage = 25; // Mock data

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8 max-w-5xl">
        {/* Enhanced Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-bright to-purple-dark rounded-2xl shadow-xl">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                AI Settings
              </h1>
              <p className="text-lg text-text-secondary">
                Configuración avanzada del TikTok Brain
              </p>
            </div>
          </div>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Configure your AI-powered content analysis and recommendations to get the most out of your TikTok Brain
          </p>
        </div>

        <div className="space-y-8">
          {/* Enhanced API Configuration */}
          <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-text-primary">
                  Claude API Configuration
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-text-primary">API Key Status</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✅ Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Claude API is configured and ready for content analysis
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Brain className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="usage" className="font-semibold text-text-primary">API Usage This Month</Label>
                  <span className="text-sm font-bold text-purple-400">{usagePercentage}% used</span>
                </div>
                <div className="space-y-2">
                  <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden border border-border/30">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 rounded-full",
                        getUsageColor(usagePercentage) === 'green' && "bg-gradient-to-r from-green-500 to-emerald-500",
                        getUsageColor(usagePercentage) === 'yellow' && "bg-gradient-to-r from-yellow-500 to-orange-500",
                        getUsageColor(usagePercentage) === 'red' && "bg-gradient-to-r from-red-500 to-red-600"
                      )}
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-text-muted">
                    <span>0%</span>
                    <span className="text-center">50%</span>
                    <span className="text-right">100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Analysis Settings */}
          <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-text-primary">
                  Analysis Frequency
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="frequency" className="font-semibold text-text-primary">
                  How often should AI analyze your content?
                </Label>
                <Select value={settings.analysisFrequency} onValueChange={(value) => handleSettingChange('analysisFrequency', value)}>
                  <SelectTrigger className="bg-background/60 border-border/60 focus:border-orange-500/50 transition-all duration-200">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">📅 Daily</SelectItem>
                    <SelectItem value="weekly">🗓️ Weekly</SelectItem>
                    <SelectItem value="monthly">📊 Monthly</SelectItem>
                    <SelectItem value="manual">⚙️ Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="border-border/30" />

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 rounded-xl p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <Label className="font-semibold text-text-primary">Auto-generate insights</Label>
                      </div>
                      <p className="text-sm text-text-secondary">Automatically analyze new video performance and patterns</p>
                    </div>
                    <Switch
                      checked={settings.autoInsights}
                      onCheckedChange={(checked) => handleSettingChange('autoInsights', checked)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <Label className="font-semibold text-text-primary">Weekly AI reports</Label>
                      </div>
                      <p className="text-sm text-text-secondary">Receive comprehensive weekly analysis reports with insights</p>
                    </div>
                    <Switch
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced AI Features */}
          <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-text-primary">
                    AI Features
                  </CardTitle>
                  <p className="text-sm text-text-secondary">
                    Enable advanced AI capabilities for your content analysis
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 rounded-xl p-4 border border-yellow-500/20">
                  <div className="flex items-center justify-between h-full">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                        <Label className="font-semibold text-text-primary">Performance Prediction</Label>
                      </div>
                      <p className="text-sm text-text-secondary">Predict viral potential before posting</p>
                    </div>
                    <Switch
                      checked={settings.performancePrediction}
                      onCheckedChange={(checked) => handleSettingChange('performancePrediction', checked)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-orange-500"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center justify-between h-full">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-500" />
                        <Label className="font-semibold text-text-primary">Content Suggestions</Label>
                      </div>
                      <p className="text-sm text-text-secondary">AI-powered content ideas based on your data</p>
                    </div>
                    <Switch
                      checked={settings.contentSuggestions}
                      onCheckedChange={(checked) => handleSettingChange('contentSuggestions', checked)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 bg-gradient-to-r from-purple-500/10 to-blue-500/5 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <Label className="font-semibold text-text-primary">Smart Analysis</Label>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          Core Feature
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary">Deep pattern recognition and trend analysis across your content</p>
                    </div>
                    <Switch
                      checked={settings.aiEnabled}
                      onCheckedChange={(checked) => handleSettingChange('aiEnabled', checked)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
                    />
                  </div>
                </div>
              </div>

              {!settings.aiEnabled && (
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">AI Analysis Disabled</p>
                      <p className="text-xs text-text-muted">Some features may not work properly without Smart Analysis enabled</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Settings Summary */}
          <Card className="bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm border border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Settings Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="font-bold text-blue-400 mb-1">Analysis</div>
                  <div className="text-xs text-text-muted capitalize">{settings.analysisFrequency}</div>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="font-bold text-green-400 mb-1">Auto Insights</div>
                  <div className="text-xs text-text-muted">{settings.autoInsights ? 'Enabled' : 'Disabled'}</div>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="font-bold text-purple-400 mb-1">Predictions</div>
                  <div className="text-xs text-text-muted">{settings.performancePrediction ? 'Enabled' : 'Disabled'}</div>
                </div>
                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="font-bold text-orange-400 mb-1">Suggestions</div>
                  <div className="text-xs text-text-muted">{settings.contentSuggestions ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Save Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              size="lg"
              className="flex items-center gap-3 px-8 py-3 text-lg font-semibold bg-gradient-primary hover:opacity-90 shadow-xl transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;