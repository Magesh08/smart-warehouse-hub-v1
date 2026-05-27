import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { KeyRound, User as UserIcon, Lock, Sparkles, Activity } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await login({ username, password });
      navigate('/smartwarehouseapp');
    } catch (err: any) {
      // Error is handled in context/api, but reset loading
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050508] overflow-hidden px-4">
      {/* Background visual accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] animate-pulse [animation-duration:8s]"></div>

      {/* Premium Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-4">
            <div className="flex items-center justify-center w-full h-full bg-[#050508] rounded-2xl">
              <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
            Boulty <span className="text-cyan-400 font-light">Warehouse</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 tracking-widest uppercase mt-1">
            Smart Management Gateway
          </p>
        </div>

        <Card className="border border-white/10 bg-black/45 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1.5 pb-6 text-center border-b border-white/5">
            <CardTitle className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              Portal Access
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Enter your credentials to manage smart devices & orders.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {/* Username Input Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Username
                </Label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin / operator"
                    required
                    className="pl-9 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123 / operator123"
                    required
                    className="pl-9 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-6 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 gap-2 transition-all duration-300"
              >
                {loading ? 'Verifying Gateway...' : 'Unlock Portal'}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                Powered by Boulty-V1 Integration Layer
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
