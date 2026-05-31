import { useEffect } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { History, ArrowRightLeft, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import socket from '../lib/socket';

export const LogsPage = () => {
  const { logs, isLoading, fetchLogs } = useInventoryStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const refreshLogs = () => fetchLogs();
    socket.on('inventario-update', refreshLogs);
    socket.on('nueva-venta', refreshLogs);
    return () => {
      socket.off('inventario-update', refreshLogs);
      socket.off('nueva-venta', refreshLogs);
    };
  }, [fetchLogs]);

  const getLogIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'AJUSTE': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'PRECIO': return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      default: return <History className="h-5 w-5 text-slate-500" />;
    }
  };

  const getLogColor = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'border-emerald-500 text-emerald-500 bg-emerald-500/10';
      case 'AJUSTE': return 'border-red-500 text-red-500 bg-red-500/10';
      case 'PRECIO': return 'border-blue-500 text-blue-500 bg-blue-500/10';
      default: return 'border-slate-500 text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Historial de Movimientos</h2>
          <p className="text-slate-400 font-medium">Auditoría completa de entradas, ajustes y cambios de precio.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-12 w-12" />
        </div>
      ) : (
        <div className="grid gap-4">
          {logs.map((log, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={log.id}
            >
              <Card className="bg-slate-900/40 border-white/10 hover:border-white/20 transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-6 p-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                      {getLogIcon(log.tipo)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLogColor(log.tipo)}`}>
                          {log.tipo}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(log.fecha).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white uppercase tracking-tight">{log.producto?.nombre}</h4>
                      <p className="text-sm text-slate-400 mt-0.5">{log.motivo}</p>
                    </div>

                    {log.cantidad !== 0 && (
                      <div className="text-right px-4">
                        <div className={`text-xl font-black ${log.tipo === 'ENTRADA' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {log.tipo === 'ENTRADA' ? '+' : '-'}{log.cantidad}
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Unidades</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-center p-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
              <History className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 font-medium italic">No se han registrado movimientos todavía.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
