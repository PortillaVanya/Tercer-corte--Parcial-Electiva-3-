import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router';
import { Package, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="h-12 w-12 rounded-2xl premium-gradient flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Package className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase group-hover:text-blue-400 transition-colors">Gestión de Inventario</span>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/login')}
          className="rounded-xl px-6 font-bold hover:bg-white hover:text-black transition-all"
        >
          Iniciar Sesión
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-0" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8 uppercase flex flex-col items-center">
              <span>Gestión de</span>
              <span className="bg-blue-600 px-8 py-2 my-2 inline-block shadow-2xl shadow-blue-500/50">Inventario</span>
              <span>Profesional</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Optimiza tu flujo de trabajo con nuestra plataforma de administración de stock de alto rendimiento. Control total, métricas en tiempo real y seguridad garantizada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="h-16 px-10 text-lg font-bold premium-gradient rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all gap-3"
            >
              Comenzar Ahora <ArrowRight className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 text-lg font-bold rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              Ver Demo
            </Button>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-40">
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-blue-500" />}
            title="Seguridad JWT"
            description="Protección de datos y control de acceso basado en roles para tu total tranquilidad."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 text-purple-500" />}
            title="Métricas de Negocio"
            description="Visualiza la salud de tu stock con KPIs precisos y gráficos dinámicos."
          />
          <FeatureCard
            icon={<Package className="h-8 w-8 text-emerald-500" />}
            title="Escalabilidad"
            description="Arquitectura NestJS diseñada para crecer junto a tu catálogo de productos."
          />
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Gestión de Inventario - SGI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all"
  >
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);
