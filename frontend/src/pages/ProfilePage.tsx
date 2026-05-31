import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Lock } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Mi Perfil</h2>
          <p className="text-slate-400 font-medium">Gestiona tu información personal y seguridad.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="bg-slate-900/40 border-white/10 md:col-span-1 overflow-hidden">
          <div className="h-24 premium-gradient" />
          <CardContent className="pt-0 -mt-12 text-center pb-8">
            <div className="h-24 w-24 rounded-3xl bg-[#0f172a] border-4 border-[#0f172a] mx-auto flex items-center justify-center shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-500/20 group-hover:scale-110 transition-transform" />
               <User className="h-12 w-12 text-blue-500 relative z-10" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white uppercase tracking-tight">{user?.username}</h3>
            <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
            <Badge className="mt-4 premium-gradient border-none px-4 py-1">{user?.role?.name || 'Administrador'}</Badge>
          </CardContent>
        </Card>

        {/* Info & Security */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-white/10">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" /> Datos de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario</label>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold">
                    <User className="h-4 w-4 text-blue-500" />
                    {user?.username}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Registrado</label>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold">
                    <Mail className="h-4 w-4 text-blue-500" />
                    {user?.email}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol de Sistema</label>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold">
                    <Shield className="h-4 w-4 text-blue-500" />
                    {user?.role?.name || 'Admin'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID de Usuario</label>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold">
                    <Lock className="h-4 w-4 text-blue-500" />
                    #{user?.id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/10 border-dashed">
            <CardContent className="p-10 text-center">
              <Lock className="h-10 w-10 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">La edición de perfil está deshabilitada temporalmente por políticas de seguridad del AdminPanel.</p>
              <Button variant="ghost" className="mt-4 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">Contactar a Soporte Técnico</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);
