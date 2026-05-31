/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { InventarioLogEntity } from 'src/inventario/entities/inventario-log.entity';
import { InventarioEntity } from 'src/inventario/entities/inventario.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductoFullResponseDto,
  ProductoDetalleDto,
} from './dto/producto-full.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    @InjectRepository(InventarioLogEntity)
    private readonly logRepository: Repository<InventarioLogEntity>,
  ) {}

  async findAll(): Promise<ProductoEntity[]> {
    const productos = await this.productoRepository.find({
      relations: ['categorias'],
    });
    return productos;
  }

  async findOne(id: number): Promise<ProductoEntity> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['categorias', 'inventario'],
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductoEntity> {
    const producto = this.productoRepository.create({
      nombre: createProductDto.nombre,
      precio: createProductDto.precio,
      categoriaId: createProductDto.categoriaId,
      imagen: createProductDto.imagen,
      inventario: {
        stock: createProductDto.stock || 0,
      },
    });
    return await this.productoRepository.save(producto);
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{ data: ProductoEntity[]; total: number }> {
    const [data, total] = await this.productoRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { nombre: 'ASC' },
      relations: ['categorias', 'inventario'],
    });
    return { data, total };
  }

  async searchByName(name: string): Promise<ProductoEntity[]> {
    const productos = await this.productoRepository
      .createQueryBuilder('producto')
      .where('LOWER(producto.nombre) LIKE :name', {
        name: `%${name.toLowerCase()}%`,
      })
      .leftJoinAndSelect('producto.categorias', 'categoria')
      .getMany();
    return productos;
  }

  // Función para listar productos con su categoría e inventario, aplicando reglas de negocio como calcular el valor total del inventario y clasificar el estado del stock
  async findProductosConCategoriaEInventario(): Promise<ProductoFullResponseDto> {
    const productos = await this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categorias', 'categoria')
      .leftJoinAndSelect('producto.inventario', 'inventario')
      .orderBy('producto.nombre', 'ASC')
      .getMany();

    const detalles = productos.map((item) => this.mapProductoDetalle(item));
    return this.buildResumenProducto(detalles);
  }

  // Refactor de la función anterior, separando la lógica de negocio en funciones privadas para mejorar la legibilidad y mantenibilidad del código
  async findProductosConCategoriaEInventarioRefactor(): Promise<ProductoFullResponseDto> {
    const productos = await this.findProductosEnBaseDeDatos();
    const detalles = productos.map((item) => this.mapProductoDetalle(item));
    return this.buildResumenProducto(detalles);
  }

  // Función privada para obtener productos con relaciones y aplicar filtros básicos desde la base de datos, dejando la lógica de negocio para funciones privadas posteriores
  private async findProductosEnBaseDeDatos(): Promise<ProductoEntity[]> {
    return this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categorias', 'categoria')
      .leftJoinAndSelect('producto.inventario', 'inventario')
      .where('producto.precio > :precioMin', { precioMin: 0 })
      .getMany();
  }

  // Función privada para mapear ProductoEntity a ProductoDetalleDto con reglas de negocio
  private mapProductoDetalle(producto: ProductoEntity): ProductoDetalleDto {
    const stock = producto.inventario?.stock ?? 0;
    const valorTotalInventario = Number(producto.precio) * stock;
    const estadoStock = this.calcularEstadoStock(stock);

    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      imagen: producto.imagen,
      categoria: producto.categorias,
      inventario: producto.inventario,
      valorTotalInventario,
      tieneStock: stock > 0,
      estadoStock,
    };
  }

  private calcularEstadoStock(stock: number): string {
    if (stock === 0) {
      return 'AGOTADO';
    }
    if (stock <= 5) {
      return 'BAJO';
    }
    if (stock <= 15) {
      return 'NORMAL';
    }
    return 'EXCESIVO';
  }

  private buildResumenProducto(
    detalles: ProductoDetalleDto[],
  ): ProductoFullResponseDto {
    const totalProductos = detalles.length;
    const totalStock = detalles.reduce(
      (sum, item) => sum + (item.inventario?.stock ?? 0),
      0,
    );
    const totalValorInventario = detalles.reduce(
      (sum, item) => sum + item.valorTotalInventario,
      0,
    );

    return {
      totalProductos,
      totalStock,
      totalValorInventario,
      productos: detalles,
    };
  }

  async update(
    id: number,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<ProductoEntity> {
    const producto = await this.findOne(id);

    // Actualizar campos directos del producto
    if (updateProductDto.nombre) producto.nombre = updateProductDto.nombre;
    if (updateProductDto.precio) {
      const oldPrecio = producto.precio;
      producto.precio = updateProductDto.precio;
      await this.logRepository.save({
        tipo: 'PRECIO',
        cantidad: 0,
        motivo: `Cambio de precio: $${oldPrecio} -> $${updateProductDto.precio}`,
        productoId: id,
      });
    }
    if (updateProductDto.imagen) producto.imagen = updateProductDto.imagen;
    if (updateProductDto.categoriaId)
      producto.categoriaId = updateProductDto.categoriaId;

    // Actualizar stock en el inventario relacionado
    if (updateProductDto.stock !== undefined) {
      const oldStock = producto.inventario?.stock || 0;
      const diff = updateProductDto.stock - oldStock;

      if (producto.inventario) {
        producto.inventario.stock = updateProductDto.stock;
      } else {
        producto.inventario = {
          stock: updateProductDto.stock,
        } as InventarioEntity;
      }

      if (diff !== 0) {
        await this.logRepository.save({
          tipo: diff > 0 ? 'ENTRADA' : 'AJUSTE',
          cantidad: Math.abs(diff),
          motivo:
            diff > 0
              ? 'Entrada de proveedor / reabastecimiento'
              : 'Ajuste manual por daño / merma',
          productoId: id,
        });
      }
    }

    return await this.productoRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productoRepository.softRemove(producto);
  }
  async getHealthMetrics() {
    const productos = await this.productoRepository.find({
      relations: ['categorias', 'inventario'],
    });

    const categorias = await this.productoRepository.query(
      'SELECT * FROM categorias',
    );

    const stockCritico = productos.filter(
      (p) =>
        (p.inventario?.stock || 0) < (p.inventario?.stockMinimo || 5) &&
        (p.inventario?.stock || 0) > 0,
    );
    const agotados = productos.filter((p) => (p.inventario?.stock || 0) === 0);
    const valorTotal = productos.reduce(
      (sum, p) => sum + Number(p.precio) * (p.inventario?.stock || 0),
      0,
    );

    // Distribution by category
    const distribution: Record<string, number> = {};
    productos.forEach((p) => {
      const catName = p.categorias?.nombre || 'Sin categoría';
      distribution[catName] = (distribution[catName] || 0) + 1;
    });

    const distributionArray = Object.keys(distribution).map((name) => ({
      name,
      value: distribution[name],
    }));

    // Location status
    const locationStats: Record<string, number> = {};
    productos.forEach((p) => {
      const loc = p.inventario?.ubicacion || 'Bodega A';
      locationStats[loc] =
        (locationStats[loc] || 0) + (p.inventario?.stock || 0);
    });

    const locationArray = Object.keys(locationStats).map((name) => ({
      name,
      stock: locationStats[name],
    }));

    const logs = await this.logRepository.find({
      order: { fecha: 'DESC' },
      take: 10,
      relations: ['producto'],
    });

    return {
      kpis: {
        stockCritico: stockCritico.length,
        agotados: agotados.length,
        valorTotal,

        categoriasActivas: categorias.length,
      },
      alertList: stockCritico.concat(agotados).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.inventario?.stock || 0,
        minimo: p.inventario?.stockMinimo || 5,
        estado: (p.inventario?.stock || 0) === 0 ? 'AGOTADO' : 'CRÍTICO',
      })),
      distribution: distributionArray,
      locationStatus: locationArray,
      recentLogs: logs.map((l) => ({
        id: l.id,
        tipo: l.tipo,
        cantidad: l.cantidad,
        motivo: l.motivo,
        fecha: l.fecha,
        producto: l.producto?.nombre,
      })),
    };
  }
}
