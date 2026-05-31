import { Controller, Get, Post, Body, UseGuards, Res } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import { Backup } from './backup.service';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  async exportBackup(@Res() response: Response) {
    const backup = await this.backupService.createBackup();
    response.setHeader('Content-Type', 'application/json');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=backup-${Date.now()}.json`,
    );
    response.send(backup);
  }

  @Post('restore')
  async restoreBackup(@Body() backup: Backup) {
    return this.backupService.restoreBackup(backup);
  }

  @Get('preview')
  async previewBackup() {
    return this.backupService.createBackup();
  }
}
