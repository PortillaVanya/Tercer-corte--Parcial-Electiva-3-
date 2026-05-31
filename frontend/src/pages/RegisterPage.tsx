import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Intentando registrar con:', { username, email, passwordLength: password.length });
    
    // Validaciones básicas
    if (username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Por favor ingresa un email válido');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      console.log('Enviando datos de registro...');
      await register({ username, email, password });
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al registrarse';
      toast.error(errorMessage);
      console.error('Error de registro completo:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 relative z-10"
      >
        <Card className="glass border-white/10 shadow-2xl overflow-hidden">
          <div className="h-2 premium-gradient" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-xl premium-gradient flex items-center justify-center mb-4 shadow-lg">
              <UserPlus className="text-white h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">Crear Cuenta</CardTitle>
            <p className="text-sm text-slate-400 mt-2">Únete a la mejor plataforma de gestión</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-9 h-4 w-4 text-slate-500 z-10" />
                <Input
                  label="Nombre de Usuario"
                  type="text"
                  placeholder="jdoe"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-9 h-4 w-4 text-slate-500 z-10" />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-9 h-4 w-4 text-slate-500 z-10" />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full premium-gradient hover:opacity-90 transition-opacity" isLoading={isLoading}>
                Registrarme ahora
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm pb-8">
            <p className="text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
