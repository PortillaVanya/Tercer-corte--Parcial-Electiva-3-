import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useProductStore } from '../store/productStore';
import { useEffect, useState } from 'react';
import { AlertTriangle, PackageSearch, DollarSign, Layers, ArrowUpRight, MapPin, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import socket from '../lib/socket';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { healthMetrics, fetchHealthMetrics, isLoading } = useProductStore();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchHealthMetrics();
  }, [fetchHealthMetrics]);

  useEffect(() => {
    const handleRealTimeUpdate = () => {
      setIsRefreshing(true);
      fetchHealthMetrics().then(() => {
        setLastUpdate(new Date());
        setIsRefreshing(false);
      });
    };

    socket.on('inventario-update', handleRealTimeUpdate);
    socket.on('nueva-venta', handleRealTimeUpdate);
    socket.on('alerta-stock', handleRealTimeUpdate);
    socket.on('notificacion', handleRealTimeUpdate);

    return () => {
      socket.off('inventario-update', handleRealTimeUpdate);
      socket.off('nueva-venta', handleRealTimeUpdate);
      socket.off('alerta-stock', handleRealTimeUpdate);
      socket.off('notificacion', handleRealTimeUpdate);
    };
  }, [fetchHealthMetrics]);

  if (!healthMetrics && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-xl font-bold text-slate-400">CARGANDO MÉTRICAS DE NEGOCIO...</div>
      </div>
    );
  }

  const { kpis, alertList, distribution, locationStatus, recentLogs } = healthMetrics || {
    kpis: { stockCritico: 0, agotados: 0, valorTotal: 0, categoriasActivas: 0 },
    alertList: [],
    distribution: [],
    locationStatus: [],
    recentLogs: []
  };

  const stats = [
    { title: 'Stock Crítico', value: kpis.stockCritico, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Agotados', value: kpis.agotados, icon: PackageSearch, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Valor Total Stock', value: `$${kpis.valorTotal.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Categorías Activas', value: kpis.categoriasActivas, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Salud de Inventario</h2>
          <p className="text-slate-400 font-medium">Panel de Inteligencia de Negocio para Admin.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-black text-blue-500 uppercase tracking-widest">Usuario Conectado</p>
          <p className="text-lg font-bold text-white">{user?.username}</p>
          <p className="text-xs text-slate-500 mt-1">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setIsRefreshing(true);
            fetchHealthMetrics().then(() => {
              setLastUpdate(new Date());
              setIsRefreshing(false);
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/40 border-white/10 hover:border-white/20 transition-all overflow-hidden relative group">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color} relative z-10`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  <ArrowUpRight className="h-3 w-3" /> Actualizado ahora
                </div>
                {isRefreshing && (
                  <div className="mt-2 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Distribution Chart */}
        <Card className="bg-slate-900/40 border-white/10 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-bold text-white uppercase tracking-tight">Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={500}
                >
                  {distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Location Status */}
        <Card className="bg-slate-900/40 border-white/10 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" /> Estado de Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationStatus}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="stock" fill="#3b82f6" radius={[6, 6, 0, 0]} animationDuration={500} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Chart */}
      <Card className="bg-slate-900/40 border-white/10 p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-500" /> Actividad en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentLogs.slice(-10).map((log, i) => ({ 
              name: `Log ${i + 1}`, 
              cantidad: log.cantidad || 0,
              time: new Date(log.fecha).toLocaleTimeString()
            }))}>
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              />
              <Line type="monotone" dataKey="cantidad" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alert List */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-slate-900/40 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Lista de Alerta Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-white/5">
              {alertList.length > 0 ? (
                alertList.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${product.estado === 'AGOTADO' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        <PackageSearch className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase tracking-tight">{product.nombre}</p>
                        <p className="text-xs text-slate-500">Mínimo: {product.minimo}</p>
                      </div>
                    </div>
                    <Badge variant={product.estado === 'AGOTADO' ? 'destructive' : 'warning'} className="uppercase font-black text-[10px]">
                      {product.estado}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500">Sin alertas</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-purple-500" /> Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-white/5">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                        log.tipo === 'ENTRADA' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' :
                        log.tipo === 'AJUSTE' ? 'border-red-500 text-red-500 bg-red-500/10' :
                        'border-blue-500 text-blue-500 bg-blue-500/10'
                      }`}>
                        {log.tipo}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{new Date(log.fecha).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-bold text-white">{log.producto}</p>
                    <p className="text-xs text-slate-400 mt-1">{log.motivo}</p>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500">No hay actividad registrada</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
