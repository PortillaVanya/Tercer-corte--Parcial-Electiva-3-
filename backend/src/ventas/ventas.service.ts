import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaEntity } from './entities/venta.entity';
import { VentaDetalleEntity } from './entities/venta-detalle.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(VentaEntity)
    private readonly ventaRepository: Repository<VentaEntity>,
    @InjectRepository(VentaDetalleEntity)
    private readonly detalleRepository: Repository<VentaDetalleEntity>,
    @InjectRepository(InventarioLogEntity)
    private readonly logRepository: Repository<InventarioLogEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    private readonly websocketsGateway: WebsocketsGateway,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async createVenta(dto: CreateVentaDto) {
    // Generar número de factura
    const numeroFactura = `FAC-${Date.now()}`;

    const venta = new VentaEntity();
    venta.numeroFactura = numeroFactura;
    venta.fechaVenta = new Date(dto.fechaVenta);
    venta.vendedorId = dto.vendedorId;
    venta.metodoPago = dto.metodoPago;
    venta.descuento = dto.descuentoGlobal || 0;
    venta.notas = dto.notas || '';
    venta.subtotal = 0;
    venta.impuesto = 0;
    venta.total = 0;
    venta.estado = 'COMPLETADA';

    const savedVenta = await this.ventaRepository.save(venta);

    let subtotal = 0;
    for (const detalleDto of dto.detalles) {
      const producto = await this.productoRepository.findOne({
        where: { id: detalleDto.productoId },
        relations: ['inventario'],
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${detalleDto.productoId} no encontrado`,
        );
      }

      // Verificar stock
      if ((producto.inventario?.stock || 0) < detalleDto.cantidad) {
        throw new NotFoundException(
          `Stock insuficiente para ${producto.nombre}`,
        );
      }

      const detalleSubtotal = detalleDto.precioUnitario * detalleDto.cantidad;
      const descuento = detalleDto.descuento || 0;
      subtotal += detalleSubtotal - descuento;

      const detalle = new VentaDetalleEntity();
      detalle.ventaId = savedVenta.id;
      detalle.productoId = detalleDto.productoId;
      detalle.cantidad = detalleDto.cantidad;
      detalle.precioUnitario = detalleDto.precioUnitario;
      detalle.subtotal = detalleSubtotal;
      detalle.descuento = descuento;
      await this.detalleRepository.save(detalle);

      // Actualizar stock
      if (producto.inventario) {
        producto.inventario.stock -= detalleDto.cantidad;
        await this.productoRepository.save(producto);

        // Registrar log de salida
        await this.logRepository.save({
          tipo: 'AJUSTE',
          cantidad: detalleDto.cantidad,
          motivo: `Venta ${numeroFactura}`,
          productoId: detalleDto.productoId,
        });
      }
    }

    // Calcular totales
    const impuesto = subtotal * 0.18; // 18% IVA
    const total = subtotal + impuesto - venta.descuento;

    savedVenta.subtotal = subtotal;
    savedVenta.impuesto = impuesto;
    savedVenta.total = total;
    await this.ventaRepository.save(savedVenta);
    this.websocketsGateway.emitNuevaVenta(savedVenta);
    this.websocketsGateway.emitInventarioUpdate({
      tipo: 'VENTA',
      ventaId: savedVenta.id,
      fecha: savedVenta.fechaVenta,
    });

    // Create notification for new sale (IN_APP)
    await this.notificacionesService.createNotificacion({
      tipo: 'IN_APP',
      titulo: `💰 Nueva Venta: ${numeroFactura}`,
      mensaje: `Venta realizada por $${total.toFixed(2)} con ${dto.detalles.length} productos`,
      usuarioId: dto.vendedorId,
      metadata: { ventaId: savedVenta.id, numeroFactura },
    });

    // Create email notification for new sale
    await this.notificacionesService.createNotificacion({
      tipo: 'EMAIL',
      titulo: `Nueva Venta Registrada - ${numeroFactura}`,
      mensaje: `Se ha realizado una nueva venta por $${total.toFixed(2)} con ${dto.detalles.length} productos.\n\nFactura: ${numeroFactura}\nFecha: ${savedVenta.fechaVenta.toLocaleString()}\nVendedor ID: ${dto.vendedorId}`,
      usuarioId: dto.vendedorId,
      metadata: { ventaId: savedVenta.id, numeroFactura, total },
    });

    return savedVenta;
  }

  async findAllVentas() {
    return await this.ventaRepository.find({
      relations: ['vendedor', 'detalles', 'detalles.producto'],
      order: { fechaVenta: 'DESC' },
    });
  }

  async findOneVenta(id: number) {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['vendedor', 'detalles', 'detalles.producto'],
    });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
    return venta;
  }

  async cancelarVenta(id: number) {
    const venta = await this.findOneVenta(id);

    if (venta.estado === 'CANCELADA') {
      throw new NotFoundException('La venta ya está cancelada');
    }

    // Restaurar stock
    for (const detalle of venta.detalles) {
      const producto = await this.productoRepository.findOne({
        where: { id: detalle.productoId },
        relations: ['inventario'],
      });

      if (producto && producto.inventario) {
        producto.inventario.stock += detalle.cantidad;
        await this.productoRepository.save(producto);

        // Registrar log de entrada
        await this.logRepository.save({
          tipo: 'ENTRADA',
          cantidad: detalle.cantidad,
          motivo: `Cancelación venta ${venta.numeroFactura}`,
          productoId: detalle.productoId,
        });
      }
    }

    venta.estado = 'CANCELADA';
    const ventaCancelada = await this.ventaRepository.save(venta);
    this.websocketsGateway.emitInventarioUpdate({
      tipo: 'CANCELACION_VENTA',
      ventaId: ventaCancelada.id,
      fecha: new Date(),
    });

    // Create notification for cancelled sale (IN_APP)
    await this.notificacionesService.createNotificacion({
      tipo: 'IN_APP',
      titulo: `❌ Venta Cancelada: ${venta.numeroFactura}`,
      mensaje: `La venta por $${Number(venta.total).toFixed(2)} ha sido cancelada`,
      usuarioId: venta.vendedorId,
      metadata: {
        ventaId: ventaCancelada.id,
        numeroFactura: venta.numeroFactura,
      },
    });

    // Create email notification for cancelled sale
    await this.notificacionesService.createNotificacion({
      tipo: 'EMAIL',
      titulo: `Venta Cancelada - ${venta.numeroFactura}`,
      mensaje: `La venta por $${Number(venta.total).toFixed(2)} ha sido cancelada.\n\nFactura: ${venta.numeroFactura}\nFecha de cancelación: ${new Date().toLocaleString()}`,
      usuarioId: venta.vendedorId,
      metadata: {
        ventaId: ventaCancelada.id,
        numeroFactura: venta.numeroFactura,
        total: venta.total,
      },
    });

    return ventaCancelada;
  }

  async getEstadisticasVentas(fechaInicio?: Date, fechaFin?: Date) {
    let query = this.ventaRepository
      .createQueryBuilder('venta')
      .leftJoinAndSelect('venta.detalles', 'detalles');

    if (fechaInicio && fechaFin) {
      query = query.where('venta.fechaVenta BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });
    }

    const ventas = await query.getMany();

    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const productosVendidos = ventas.reduce(
      (sum, v) => sum + v.detalles.reduce((s, d) => s + d.cantidad, 0),
      0,
    );

    // Ventas por método de pago
    const porMetodoPago: Record<string, number> = {};
    ventas.forEach((v) => {
      porMetodoPago[v.metodoPago] =
        (porMetodoPago[v.metodoPago] || 0) + Number(v.total);
    });

    // Productos más vendidos
    const productosMasVendidos: Record<string, number> = {};
    ventas.forEach((v) => {
      v.detalles.forEach((d) => {
        const nombre = d.producto?.nombre || 'Desconocido';
        productosMasVendidos[nombre] =
          (productosMasVendidos[nombre] || 0) + d.cantidad;
      });
    });

    return {
      totalVentas,
      totalIngresos,
      productosVendidos,
      porMetodoPago: Object.entries(porMetodoPago).map(([metodo, total]) => ({
        metodo,
        total,
      })),
      productosMasVendidos: Object.entries(productosMasVendidos)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10),
    };
  }
}
