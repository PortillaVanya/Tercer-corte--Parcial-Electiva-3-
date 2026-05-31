import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  DemandPredictionService,
  PredictionResult,
} from './demand-prediction.service';

@ApiTags('ml')
@Controller('ml')
@UseGuards(JwtAuthGuard)
export class MlController {
  constructor(
    private readonly demandPredictionService: DemandPredictionService,
  ) {}

  @ApiOperation({ summary: 'Predecir demanda por producto' })
  @Get('demand')
  async predictDemand(
    @Query('days') days?: string,
  ): Promise<PredictionResult[]> {
    const parsedDays = Number(days);
    const safeDays =
      Number.isFinite(parsedDays) && parsedDays > 0
        ? Math.floor(parsedDays)
        : 30;
    return this.demandPredictionService.predictDemand(safeDays);
  }

  @ApiOperation({ summary: 'Obtener tendencias históricas por producto' })
  @Get('trends/:productId')
  async getTrends(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<any> {
    return this.demandPredictionService.getTrends(productId);
  }
}
