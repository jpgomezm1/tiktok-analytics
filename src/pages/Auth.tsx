import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, BarChart3, Users, Eye } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
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
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to your analytics dashboard.'
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
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Check your email to verify your account.'
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
              Transform your TikTok data into actionable insights. Discover what works, optimize your content, and scale your success.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Growth Tracking</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Performance Analytics</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Audience Insights</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <p className="text-text-secondary text-sm">Content Optimization</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-text-primary">Get Started</CardTitle>
              <CardDescription className="text-text-secondary">
                Sign in to your account or create a new one to start analyzing your TikTok performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Display Name</Label>
                      <Input
                        id="signup-name"
                        name="displayName"
                        type="text"
                        placeholder="Your name or brand"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
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