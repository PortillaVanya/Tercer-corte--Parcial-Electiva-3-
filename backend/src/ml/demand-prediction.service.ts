import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { ProductoEntity } from '../productos/entities/producto.entity';

export interface PredictionResult {
  productoId: number;
  productoNombre: string;
  demandaPredicha: number;
  confianza: number;
  recomendacion: string;
}

@Injectable()
export class DemandPredictionService {
  constructor(
    @InjectRepository(InventarioLogEntity)
    private readonly logRepository: Repository<InventarioLogEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
  ) {}

  async predictDemand(days: number = 30): Promise<PredictionResult[]> {
    const productos = await this.productoRepository.find({
      relations: ['inventario'],
    });

    const resultados: PredictionResult[] = [];

    for (const producto of productos) {
      // Obtener historial de ventas del producto
      const logs = await this.logRepository.find({
        where: { productoId: producto.id, tipo: 'AJUSTE' }, // Salidas por ventas
        order: { fecha: 'DESC' },
        take: 90, // Últimos 90 días
      });

      if (logs.length < 5) {
        resultados.push({
          productoId: producto.id,
          productoNombre: producto.nombre,
          demandaPredicha: 0,
          confianza: 0,
          recomendacion: 'Insuficientes datos históricos',
        });
        continue;
      }

      // Calcular ventas promedio diaria
      const ventasTotales = logs.reduce((sum, log) => sum + log.cantidad, 0);
      const ventasPromedioDiaria = ventasTotales / 90;

      // Aplicar factor de estacionalidad simple
      const factorEstacional = 1.0; // Puede mejorarse con análisis de estacionalidad

      // Predicción de demanda para los próximos días
      const demandaPredicha = Math.round(
        ventasPromedioDiaria * days * factorEstacional,
      );

      // Calcular confianza basada en variabilidad
      const variaciones = logs.map((log, i) => {
        if (i === 0) return 0;
        return Math.abs(log.cantidad - logs[i - 1].cantidad);
      });
      const variabilidad =
        variaciones.reduce((sum, v) => sum + v, 0) / variaciones.length;
      const confianzaBase =
        ventasPromedioDiaria > 0
          ? 100 - (variabilidad / ventasPromedioDiaria) * 50
          : 0;
      const confianza = Math.max(0, Math.min(100, confianzaBase));

      // Generar recomendación
      const stockActual = producto.inventario?.stock || 0;
      let recomendacion = 'Mantener stock actual';

      if (demandaPredicha > stockActual) {
        const deficit = demandaPredicha - stockActual;
        recomendacion = `Reabastecer ${deficit} unidades para cubrir demanda`;
      } else if (stockActual > demandaPredicha * 2) {
        recomendacion = 'Stock excesivo, considerar promociones';
      }

      resultados.push({
        productoId: producto.id,
        productoNombre: producto.nombre,
        demandaPredicha,
        confianza: Math.round(confianza),
        recomendacion,
      });
    }

    return resultados.sort((a, b) => b.demandaPredicha - a.demandaPredicha);
  }

  async getTrends(productId: number): Promise<any> {
    const logs = await this.logRepository.find({
      where: { productoId: productId },
      order: { fecha: 'ASC' },
      take: 365, // Último año
    });

    // Agrupar por mes
    const porMes: Record<string, number> = {};
    logs.forEach((log) => {
      const mes = log.fecha.toISOString().substring(0, 7); // YYYY-MM
      porMes[mes] = (porMes[mes] || 0) + log.cantidad;
    });

    return {
      productoId: productId,
      datos: Object.entries(porMes).map(([mes, cantidad]) => ({
        mes,
        cantidad,
      })),
    };
  }
}
