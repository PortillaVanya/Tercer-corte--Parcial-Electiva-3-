import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorEntity } from './entities/proveedor.entity';
import { OrdenCompraEntity } from './entities/orden-compra.entity';
import { OrdenCompraDetalleEntity } from './entities/orden-compra-detalle.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(ProveedorEntity)
    private readonly proveedorRepository: Repository<ProveedorEntity>,
    @InjectRepository(OrdenCompraEntity)
    private readonly ordenCompraRepository: Repository<OrdenCompraEntity>,
    @InjectRepository(OrdenCompraDetalleEntity)
    private readonly detalleRepository: Repository<OrdenCompraDetalleEntity>,
    @InjectRepository(InventarioLogEntity)
    private readonly logRepository: Repository<InventarioLogEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async createProveedor(dto: CreateProveedorDto) {
    const proveedor = this.proveedorRepository.create(dto);
    return await this.proveedorRepository.save(proveedor);
  }

  async findAllProveedores() {
    return await this.proveedorRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOneProveedor(id: number) {
    const proveedor = await this.proveedorRepository.findOne({
      where: { id },
      relations: ['ordenesCompra'],
    });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return proveedor;
  }

  async updateProveedor(id: number, dto: Partial<CreateProveedorDto>) {
    const proveedor = await this.findOneProveedor(id);
    Object.assign(proveedor, dto);
    return await this.proveedorRepository.save(proveedor);
  }

  async removeProveedor(id: number) {
    const proveedor = await this.findOneProveedor(id);
    return await this.proveedorRepository.remove(proveedor);
  }

  async createOrdenCompra(dto: CreateOrdenCompraDto) {
    // Generar número de orden
    const numeroOrden = `OC-${Date.now()}`;

    const orden = new OrdenCompraEntity();
    orden.numeroOrden = numeroOrden;
    orden.fechaOrden = new Date(dto.fechaOrden);
    orden.fechaEntregaEsperada = dto.fechaEntregaEsperada
      ? new Date(dto.fechaEntregaEsperada)
      : null;
    orden.proveedorId = dto.proveedorId;
    orden.estado = dto.estado || 'PENDIENTE';
    orden.notas = dto.notas || null;
    orden.total = 0;

    const savedOrden = await this.ordenCompraRepository.save(orden);

    let total = 0;
    for (const detalleDto of dto.detalles) {
      const subtotal = detalleDto.precioUnitario * detalleDto.cantidad;
      total += subtotal;

      const detalle = new OrdenCompraDetalleEntity();
      detalle.ordenCompraId = savedOrden.id;
      detalle.productoId = detalleDto.productoId;
      detalle.cantidad = detalleDto.cantidad;
      detalle.precioUnitario = detalleDto.precioUnitario;
      detalle.subtotal = subtotal;
      await this.detalleRepository.save(detalle);
    }

    savedOrden.total = total;
    const finalOrden = await this.ordenCompraRepository.save(savedOrden);

    // Obtener proveedor para enviar notificación (no bloqueante)
    this.proveedorRepository
      .findOne({
        where: { id: dto.proveedorId },
      })
      .then(async (proveedor) => {
        if (proveedor) {
          try {
            await this.notificacionesService.createNotificacion({
              tipo: 'EMAIL',
              titulo: `Nueva Orden de Compra: ${numeroOrden}`,
              mensaje: `Se ha creado una nueva orden de compra ${numeroOrden} por un total de $${total.toFixed(2)}.\n\nProveedor: ${proveedor.nombre}\nFecha: ${new Date().toLocaleDateString()}`,
              destinatarioEmail: proveedor.email,
              metadata: {
                ordenId: finalOrden.id,
                proveedorId: proveedor.id,
                total,
              },
            });
          } catch (error) {
            console.log('No se pudo enviar la notificación por email:', error);
          }
        }
      })
      .catch((error) => {
        console.log('Error al obtener proveedor para notificación:', error);
      });

    // Obtener orden completa con relaciones
    return await this.findOneOrdenCompra(finalOrden.id);
  }

  async findAllOrdenesCompra() {
    return await this.ordenCompraRepository.find({
      relations: ['proveedor', 'detalles', 'detalles.producto'],
      order: { fechaOrden: 'DESC' },
    });
  }

  async findOneOrdenCompra(id: number) {
    const orden = await this.ordenCompraRepository.findOne({
      where: { id },
      relations: ['proveedor', 'detalles', 'detalles.producto'],
    });
    if (!orden) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }
    return orden;
  }

  async recibirOrdenCompra(id: number) {
    const orden = await this.findOneOrdenCompra(id);

    if (orden.estado !== 'ENVIADO') {
      throw new NotFoundException(
        'La orden debe estar en estado ENVIADO para recibirse',
      );
    }

    // Actualizar stock de cada producto
    for (const detalle of orden.detalles) {
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
          motivo: `Recepción de orden de compra ${orden.numeroOrden}`,
          productoId: detalle.productoId,
        });
      }
    }

    orden.estado = 'RECIBIDO';
    orden.fechaEntregaReal = new Date();
    return await this.ordenCompraRepository.save(orden);
  }

  async updateOrdenCompraEstado(
    id: number,
    estado: 'PENDIENTE' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO',
  ) {
    const orden = await this.findOneOrdenCompra(id);
    orden.estado = estado;
    return await this.ordenCompraRepository.save(orden);
  }

  async updateOrdenCompra(id: number, dto: CreateOrdenCompraDto) {
    console.log('=== Actualizando orden ===');
    console.log('ID:', id);
    console.log('DTO:', dto);

    const orden = await this.findOneOrdenCompra(id);
    console.log('Orden encontrada:', orden);

    // Delete existing details
    await this.detalleRepository.delete({ ordenCompraId: id });
    console.log('Detalles eliminados');

    // Update main order fields
    orden.fechaOrden = new Date(dto.fechaOrden);
    orden.fechaEntregaEsperada = dto.fechaEntregaEsperada
      ? new Date(dto.fechaEntregaEsperada)
      : null;
    orden.proveedorId = dto.proveedorId;
    orden.estado = dto.estado || orden.estado; // Preservar estado si no se envía
    orden.notas = dto.notas !== undefined ? dto.notas : orden.notas; // Preservar notas si no se envía
    orden.total = 0;

    let total = 0;
    if (dto.detalles && dto.detalles.length > 0) {
      for (const detalleDto of dto.detalles) {
        const subtotal = detalleDto.precioUnitario * detalleDto.cantidad;
        total += subtotal;

        const detalle = new OrdenCompraDetalleEntity();
        detalle.ordenCompraId = orden.id;
        detalle.productoId = detalleDto.productoId;
        detalle.cantidad = detalleDto.cantidad;
        detalle.precioUnitario = detalleDto.precioUnitario;
        detalle.subtotal = subtotal;
        await this.detalleRepository.save(detalle);
        console.log('Detalle guardado:', detalle);
      }
    }

    orden.total = total;
    const savedOrden = await this.ordenCompraRepository.save(orden);
    console.log('Orden guardada:', savedOrden);

    // Return updated order with relations
    const result = await this.findOneOrdenCompra(savedOrden.id);
    console.log('Orden con relaciones:', result);
    return result;
  }

  async deleteOrdenCompra(id: number) {
    const orden = await this.findOneOrdenCompra(id);

    // Delete details first
    await this.detalleRepository.delete({ ordenCompraId: id });

    // Then delete the order
    return await this.ordenCompraRepository.remove(orden);
  }

  async getHistorialPreciosPorProveedor(proveedorId: number) {
    const ordenes = await this.ordenCompraRepository.find({
      where: { proveedorId },
      relations: ['detalles', 'detalles.producto'],
      order: { fechaOrden: 'DESC' },
    });

    const historial: Record<string, any[]> = {};

    ordenes.forEach((orden) => {
      orden.detalles.forEach((detalle) => {
        const productoNombre = detalle.producto?.nombre || 'Desconocido';
        if (!historial[productoNombre]) {
          historial[productoNombre] = [];
        }
        historial[productoNombre].push({
          fecha: orden.fechaOrden,
          precio: detalle.precioUnitario,
          cantidad: detalle.cantidad,
          numeroOrden: orden.numeroOrden,
        });
      });
    });

    return historial;
  }
}
