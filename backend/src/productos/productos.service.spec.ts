import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { ProductoEntity } from './entities/producto.entity';
import { ProductosService } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;
  const repositoryMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(ProductoEntity),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(InventarioLogEntity),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
