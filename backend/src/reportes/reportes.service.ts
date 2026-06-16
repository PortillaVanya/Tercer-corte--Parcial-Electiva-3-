import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import * as xlsx from 'xlsx';
import { jsPDF } from 'jspdf';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    @InjectRepository(InventarioLogEntity)
    private readonly logRepository: Repository<InventarioLogEntity>,
  ) {}

  async exportarInventarioExcel() {
    const productos = await this.productoRepository.find({
      relations: ['categorias', 'inventario'],
    });

    const data = productos.map((p) => ({
      ID: p.id,
      Nombre: p.nombre,
      Precio: Number(p.precio),
      Stock: p.inventario?.stock || 0,
      'Stock Mínimo': p.inventario?.stockMinimo || 0,
      Ubicación: p.inventario?.ubicacion || '',
      Categoría: p.categorias?.nombre || '',
      'Valor Total': Number(p.precio) * (p.inventario?.stock || 0),
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportarInventarioCSV() {
    const productos = await this.productoRepository.find({
      relations: ['categorias', 'inventario'],
    });

    const data = productos.map((p) => ({
      ID: p.id,
      Nombre: p.nombre,
      Precio: Number(p.precio),
      Stock: p.inventario?.stock || 0,
      'Stock Mínimo': p.inventario?.stockMinimo || 0,
      Ubicación: p.inventario?.ubicacion || '',
      Categoría: p.categorias?.nombre || '',
      'Valor Total': Number(p.precio) * (p.inventario?.stock || 0),
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return xlsx.write(workbook, { type: 'buffer', bookType: 'csv' });
  }

  async generarReportePDF() {
    const productos = await this.productoRepository.find({
      relations: ['categorias', 'inventario'],
    });

    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Reporte de Inventario', 20, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Productos: ${productos.length}`, 20, 40);

    // Calcular totales
    const totalStock = productos.reduce(
      (sum, p) => sum + (p.inventario?.stock || 0),
      0,
    );
    const valorTotal = productos.reduce(
      (sum, p) => sum + Number(p.precio) * (p.inventario?.stock || 0),
      0,
    );
    const agotados = productos.filter(
      (p) => (p.inventario?.stock || 0) === 0,
    ).length;
    const criticos = productos.filter(
      (p) => (p.inventario?.stock || 0) < (p.inventario?.stockMinimo || 5),
    ).length;

    doc.text(`Stock Total: ${totalStock}`, 20, 50);
    doc.text(`Valor Total: $${valorTotal.toLocaleString()}`, 20, 60);
    doc.text(`Productos Agotados: ${agotados}`, 20, 70);
    doc.text(`Stock Crítico: ${criticos}`, 20, 80);

    // Tabla de productos
    let y = 100;
    doc.setFontSize(10);
    doc.text('ID', 20, y);
    doc.text('Nombre', 35, y);
    doc.text('Stock', 100, y);
    doc.text('Precio', 130, y);
    doc.text('Valor', 160, y);

    y += 10;
    productos.slice(0, 30).forEach((p) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(p.id), 20, y);
      doc.text(p.nombre.substring(0, 20), 35, y);
      doc.text(String(p.inventario?.stock || 0), 100, y);
      doc.text(`$${Number(p.precio)}`, 130, y);
      doc.text(
        `$${(Number(p.precio) * (p.inventario?.stock || 0)).toLocaleString()}`,
        160,
        y,
      );
      y += 8;
    });

    return Buffer.from(doc.output('arraybuffer'));
  }

  async exportarLogsExcel() {
    const logs = await this.logRepository.find({
      relations: ['producto'],
      order: { fecha: 'DESC' },
    });

    const data = logs.map((l) => ({
      ID: l.id,
      Tipo: l.tipo,
      Producto: l.producto?.nombre || '',
      Cantidad: l.cantidad,
      Motivo: l.motivo,
      Fecha: l.fecha.toLocaleString(),
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Logs');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async getEstadisticas() {
    const productos = await this.productoRepository.find({
      relations: ['categorias', 'inventario'],
    });

    const totalProductos = productos.length;
    const totalStock = productos.reduce(
      (sum, p) => sum + (p.inventario?.stock || 0),
      0,
    );
    const valorTotal = productos.reduce(
      (sum, p) => sum + Number(p.precio) * (p.inventario?.stock || 0),
      0,
    );
    const agotados = productos.filter((p) => (p.inventario?.stock || 0) === 0);
    const criticos = productos.filter(
      (p) =>
        (p.inventario?.stock || 0) > 0 &&
        (p.inventario?.stock || 0) < (p.inventario?.stockMinimo || 5),
    );

    // Distribución por categoría
    const porCategoria: Record<string, number> = {};
    productos.forEach((p) => {
      const cat = p.categorias?.nombre || 'Sin categoría';
      porCategoria[cat] = (porCategoria[cat] || 0) + 1;
    });

    return {
      totalProductos,
      totalStock,
      valorTotal,
      agotados: agotados.length,
      criticos: criticos.length,
      porCategoria: Object.entries(porCategoria).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }
}
