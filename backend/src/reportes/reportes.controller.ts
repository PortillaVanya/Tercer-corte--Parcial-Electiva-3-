import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('reportes')
@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @ApiOperation({ summary: 'Exportar inventario a Excel' })
  @Get('inventario/excel')
  async exportarInventarioExcel(@Res() res: Response) {
    const buffer = await this.reportesService.exportarInventarioExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=inventario.xlsx',
    );
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Exportar inventario a CSV' })
  @Get('inventario/csv')
  async exportarInventarioCSV(@Res() res: Response) {
    const buffer = await this.reportesService.exportarInventarioCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario.csv');
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Generar reporte PDF' })
  @Get('inventario/pdf')
  async generarReportePDF(@Res() res: Response) {
    const buffer = await this.reportesService.generarReportePDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte-inventario.pdf',
    );
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Exportar logs a Excel' })
  @Get('logs/excel')
  async exportarLogsExcel(@Res() res: Response) {
    const buffer = await this.reportesService.exportarLogsExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=logs.xlsx');
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Obtener estadísticas' })
  @Get('estadisticas')
  async getEstadisticas() {
    return await this.reportesService.getEstadisticas();
  }
}
