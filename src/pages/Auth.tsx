import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n';
import { TrendingUp, BarChart3, Users, Eye } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const t = useT;
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: t('auth.signInFailed'),
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.successSignIn')
      });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;

    const { error } = await signUp(email, password, displayName);
    
    if (error) {
      toast({
        title: t('auth.signUpFailed'),
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth.accountCreated'),
        description: t('auth.checkEmail')
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-text-primary">
              TikTok
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Analytics</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-lg mx-auto">
              Transforma tus datos de TikTok en insights accionables. Descubre qué funciona, optimiza tu contenido y escala tu éxito.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Seguimiento de crecimiento</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Análisis de rendimiento</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Insights de audiencia</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Optimización de contenido</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-text-primary">{t('auth.getStarted')}</CardTitle>
              <CardDescription className="text-text-secondary">
                {t('auth.signInDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">{t('auth.email')}</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder={t('auth.enterEmail')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">{t('auth.password')}</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder={t('auth.enterPassword')}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                      disabled={loading}
                    >
                      {loading ? t('auth.signingIn') : t('auth.signIn')}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('auth.displayName')}</Label>
                      <Input
                        id="signup-name"
                        name="displayName"
                        type="text"
                        placeholder={t('auth.nameOrBrand')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder={t('auth.enterEmail')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder={t('auth.createPassword')}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                      disabled={loading}
                    >
                      {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;