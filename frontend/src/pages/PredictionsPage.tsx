import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BrainCircuit, RefreshCcw } from 'lucide-react';

type Prediction = {
  productoId: number;
  productoNombre: string;
  demandaPredicha: number;
  confianza: number;
  recomendacion: string;
};

export const PredictionsPage = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = async (requestedDays = days) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/ml/demand?days=${requestedDays}`);
      setPredictions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Prediccion de Demanda</h2>
          <p className="text-slate-400">Estimacion simple por historial de movimientos de inventario.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 30)}
            className="h-10 w-24 rounded-md border border-white/20 bg-slate-900/50 px-3 text-white"
          />
          <Button onClick={() => fetchPredictions()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900/40 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white uppercase">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
            Resultado de predicciones ({predictions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400">Calculando predicciones...</p>
          ) : predictions.length === 0 ? (
            <p className="text-slate-500">No hay datos suficientes para generar predicciones.</p>
          ) : (
            <div className="space-y-3">
              {predictions.map((item) => (
                <div
                  key={item.productoId}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1"
                >
                  <p className="text-white font-bold">{item.productoNombre}</p>
                  <p className="text-sm text-slate-300">
                    Demanda estimada: <span className="font-semibold text-blue-400">{item.demandaPredicha}</span> unidades
                  </p>
                  <p className="text-sm text-slate-300">
                    Confianza: <span className="font-semibold text-emerald-400">{item.confianza}%</span>
                  </p>
                  <p className="text-xs text-slate-400">{item.recomendacion}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
