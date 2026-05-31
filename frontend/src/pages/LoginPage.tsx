import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Por favor completa todos los campos');
      return;
    }

    try {
      console.log('Iniciando proceso de login en componente...');
      await login({ email, password });
      toast.success('¡Autenticación exitosa!');
      
      // Pequeña pausa para asegurar que el estado se actualice antes de navegar
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (error: unknown) {
      console.error('Error en el componente de Login:', error);
      toast.error((error as Error).message || 'Credenciales incorrectas o error de servidor');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 relative z-10"
      >
        <Card className="glass border-white/20 shadow-2xl overflow-hidden bg-slate-900/40">
          <div className="h-1.5 premium-gradient" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl premium-gradient flex items-center justify-center mb-4 shadow-xl">
              <LogIn className="text-white h-8 w-8" />
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter text-white">BIENVENIDO</CardTitle>
            <p className="text-slate-400 font-medium mt-1">Accede a tu panel administrativo</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-200 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 z-10" />
                  <Input
                    type="email"
                    placeholder="admin@admin.com"
                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-200 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 z-10" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold premium-gradient hover:shadow-blue-500/25 hover:shadow-lg transition-all active:scale-[0.98]" 
                isLoading={isLoading}
              >
                INGRESAR
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 justify-center text-sm pb-8">
             <div className="h-px w-full bg-white/5" />
             <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-300 text-xs text-center">
                <p>Usa las credenciales de prueba:</p>
                <p className="font-mono mt-1">admin@email.com / admin123</p>
             </div>
            <p className="text-slate-400">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">
                Crea una aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
