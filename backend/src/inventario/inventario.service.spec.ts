import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventarioLogEntity } from './entities/inventario-log.entity';
import { InventarioService } from './inventario.service';

describe('InventarioService', () => {
  let service: InventarioService;
  const repositoryMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventarioService,
        {
          provide: getRepositoryToken(InventarioLogEntity),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<InventarioService>(InventarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
