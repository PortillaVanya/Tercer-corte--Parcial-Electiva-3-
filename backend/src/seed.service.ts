import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './usuarios/entities/usuario.entity';
import { RoleEntity } from './modules/rol/entities/role.entity';
import { ProductoEntity } from './productos/entities/producto.entity';
import { CategoriaEntity } from './categoria/entities/categoria.entity';
import { InventarioEntity } from './inventario/entities/inventario.entity';
import { InventarioLogEntity } from './inventario/entities/inventario-log.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriaRepository: Repository<CategoriaEntity>,
    @InjectRepository(InventarioEntity)
    private readonly inventarioRepository: Repository<InventarioEntity>,
    @InjectRepository(InventarioLogEntity)
    private readonly logRepository: Repository<InventarioLogEntity>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('🌱 Starting Seed...');

    // 1. Crear Roles
    let adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });
    if (!adminRole) {
      adminRole = await this.roleRepository.save({ name: 'admin' });
    }

    let userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });
    if (!userRole) {
      userRole = await this.roleRepository.save({ name: 'user' });
    }

    // 2. Crear Usuario Admin
    const adminEmail = 'admin@admin.com';
    let adminUser = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await this.userRepository.save({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: adminRole,
        roleId: adminRole.id,
      });
      console.log('✅ Usuario admin creado');
    }

    // 3. Crear Usuario Normal
    const userEmail = 'user@mail.com';
    let normalUser = await this.userRepository.findOne({
      where: { email: userEmail },
    });

    if (!normalUser) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      normalUser = await this.userRepository.save({
        username: 'user',
        email: userEmail,
        password: hashedPassword,
        role: userRole,
        roleId: userRole.id,
      });
      console.log('✅ Usuario normal creado');
    }

    // 4. Crear Categorías
    const categoryNames = ['Electrónica', 'Hogar', 'Deportes', 'Juguetes'];
    for (const name of categoryNames) {
      const catExists = await this.categoriaRepository.findOne({
        where: { nombre: name },
      });
      if (!catExists) {
        await this.categoriaRepository.save({ nombre: name });
        console.log(`✅ Categoría ${name} creada`);
      }
    }

    // 4. Crear Productos Iniciales
    const productCount = await this.productoRepository.count();

    if (productCount === 0) {
      const electronics = await this.categoriaRepository.findOne({
        where: { nombre: 'Electrónica' },
      });
      const home = await this.categoriaRepository.findOne({
        where: { nombre: 'Hogar' },
      });
      const sports = await this.categoriaRepository.findOne({
        where: { nombre: 'Deportes' },
      });
      const toys = await this.categoriaRepository.findOne({
        where: { nombre: 'Juguetes' },
      });

      interface SeedProduct {
        nombre: string;
        precio: number;
        imagen: string;
        categoriaId: number;
        stock: number;
        stockMinimo: number;
        ubicacion: string;
      }
      const products: SeedProduct[] = [];

      // 1. Electrónica (5)
      if (electronics) {
        products.push(
          {
            nombre: 'Laptop Gamer Pro',
            precio: 1250.0,
            imagen:
              'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 12,
            stockMinimo: 5,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Smartphone Galaxy Z',
            precio: 950.0,
            imagen:
              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 4,
            stockMinimo: 5,
            ubicacion: 'Vitrina',
          },
          {
            nombre: 'Auriculares Noise Cancelling',
            precio: 299.0,
            imagen:
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 0,
            stockMinimo: 3,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Monitor 4K UltraWide',
            precio: 550.0,
            imagen:
              'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 8,
            stockMinimo: 3,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Teclado Mecánico RGB',
            precio: 120.0,
            imagen:
              'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 15,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
        );
      }

      // 2. Hogar (5)
      if (home) {
        products.push(
          {
            nombre: 'Cafetera Express',
            precio: 450.0,
            imagen:
              'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 20,
            stockMinimo: 5,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Lámpara de Pie Moderna',
            precio: 85.0,
            imagen:
              'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 12,
            stockMinimo: 4,
            ubicacion: 'Vitrina',
          },
          {
            nombre: 'Aspiradora Robot v8',
            precio: 320.0,
            imagen:
              'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 6,
            stockMinimo: 2,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Licuadora Industrial',
            precio: 180.0,
            imagen:
              'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 10,
            stockMinimo: 3,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Juego de Cuchillos Pro',
            precio: 110.0,
            imagen:
              'https://images.unsplash.com/photo-1593611664162-dd09e2553924?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 15,
            stockMinimo: 5,
            ubicacion: 'Bodega A',
          },
        );
      }

      // 3. Deportes (5)
      if (sports) {
        products.push(
          {
            nombre: 'Balón de Fútbol Pro',
            precio: 45.0,
            imagen:
              'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 50,
            stockMinimo: 10,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Mancuernas de 5kg (Par)',
            precio: 35.0,
            imagen:
              'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 25,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Mat de Yoga Antideslizante',
            precio: 25.0,
            imagen:
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 30,
            stockMinimo: 5,
            ubicacion: 'Vitrina',
          },
          {
            nombre: 'Bicicleta de Montaña R29',
            precio: 850.0,
            imagen:
              'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 5,
            stockMinimo: 2,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Raqueta de Tenis Pro',
            precio: 180.0,
            imagen:
              'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 12,
            stockMinimo: 3,
            ubicacion: 'Bodega A',
          },
        );
      }

      // 4. Juguetes (5)
      if (toys) {
        products.push(
          {
            nombre: 'Bloques de Construcción 500p',
            precio: 55.0,
            imagen:
              'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 40,
            stockMinimo: 8,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Oso de Peluche Gigante',
            precio: 45.0,
            imagen:
              'https://images.unsplash.com/photo-1559440666-373a9482d791?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 18,
            stockMinimo: 5,
            ubicacion: 'Vitrina',
          },
          {
            nombre: 'Carro a Control Remoto 4WD',
            precio: 120.0,
            imagen:
              'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 10,
            stockMinimo: 3,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Juego de Mesa Estrategia',
            precio: 65.0,
            imagen:
              'https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 22,
            stockMinimo: 5,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Dinosaurio T-Rex Articulado',
            precio: 35.0,
            imagen:
              'https://images.unsplash.com/photo-1558444455-5755107d47bf?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 35,
            stockMinimo: 10,
            ubicacion: 'Estante',
          },
        );
      }

      // 5. Más productos adicionales sin repetir
      // Electrónica extra
      if (electronics) {
        products.push(
          {
            nombre: 'Tablet Pro 10',
            precio: 650.0,
            imagen:
              'https://images.unsplash.com/photo-1593032465171-5d1e1c2d3e61?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 9,
            stockMinimo: 3,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Smartwatch X2',
            precio: 199.0,
            imagen:
              'https://images.unsplash.com/photo-1532009332298-44ae53f5e40c?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 14,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Cámara DSLR',
            precio: 850.0,
            imagen:
              'https://images.unsplash.com/photo-1519183071298-44ae53f5e40c?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 6,
            stockMinimo: 2,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Altavoces Bluetooth',
            precio: 120.0,
            imagen:
              'https://images.unsplash.com/photo-1485219256185-4c4ac4d0e0c6?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 18,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Router Wi‑Fi 6',
            precio: 110.0,
            imagen:
              'https://images.unsplash.com/photo-1581291519185-0bbadf85bc2c?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 7,
            stockMinimo: 3,
            ubicacion: 'Estante',
          },
        );
      }

      // Hogar extra
      if (home) {
        products.push(
          {
            nombre: 'Horno Eléctrico',
            precio: 400.0,
            imagen:
              'https://images.unsplash.com/photo-1556912995-6d0b0d2b2a64?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 5,
            stockMinimo: 2,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Plancha a Vapor',
            precio: 70.0,
            imagen:
              'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 12,
            stockMinimo: 4,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Set de Sartenes',
            precio: 120.0,
            imagen:
              'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 9,
            stockMinimo: 3,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Cuchara de Madera',
            precio: 15.0,
            imagen:
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 30,
            stockMinimo: 10,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Cortina de Baño',
            precio: 45.0,
            imagen:
              'https://images.unsplash.com/photo-1582719508464-e5bcae4e6c23?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 20,
            stockMinimo: 5,
            ubicacion: 'Bodega B',
          },
        );
      }

      // Deportes extra
      if (sports) {
        products.push(
          {
            nombre: 'Raqueta de Badminton',
            precio: 60.0,
            imagen:
              'https://images.unsplash.com/photo-1602810318665-e0d5c99c5df5?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 15,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Guantes de Boxeo',
            precio: 50.0,
            imagen:
              'https://images.unsplash.com/photo-1585386959984-a415522a7af9?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 10,
            stockMinimo: 3,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Set de Pesas 20kg',
            precio: 200.0,
            imagen:
              'https://images.unsplash.com/photo-1585987615009-fcfd3bdadf6e?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 4,
            stockMinimo: 2,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Cuerda para Saltar',
            precio: 20.0,
            imagen:
              'https://images.unsplash.com/photo-1556905055-8f358a7a47b5?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 25,
            stockMinimo: 8,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Casco de Ciclismo',
            precio: 80.0,
            imagen:
              'https://images.unsplash.com/photo-1529270293001-0cf4e9d5b5c3?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 12,
            stockMinimo: 4,
            ubicacion: 'Estante',
          },
        );
      }

      // Juguetes extra
      if (toys) {
        products.push(
          {
            nombre: 'Puzzle 1000 piezas',
            precio: 30.0,
            imagen:
              'https://images.unsplash.com/photo-1516995302085-9ac1d71d5c1f?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 22,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Kit de Ciencia',
            precio: 45.0,
            imagen:
              'https://images.unsplash.com/photo-1518664371235-4d81d5b8bc30?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 18,
            stockMinimo: 4,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Patineta eléctrica',
            precio: 250.0,
            imagen:
              'https://images.unsplash.com/photo-1581291519202-4f3d5dc44c0b?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 7,
            stockMinimo: 2,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Muñeca de moda',
            precio: 35.0,
            imagen:
              'https://images.unsplash.com/photo-1562184648-3e9f5e2a6f5b?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 20,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Set de Construcción LEGO',
            precio: 80.0,
            imagen:
              'https://images.unsplash.com/photo-1504595403659-9088ce801e8f?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 15,
            stockMinimo: 4,
            ubicacion: 'Estante',
          },
        );
      }

      // 6. Más productos adicionales para Electrónica
      if (electronics) {
        products.push(
          {
            nombre: 'Mouse Inalámbrico',
            precio: 45.0,
            imagen:
              'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 25,
            stockMinimo: 8,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Webcam HD 1080p',
            precio: 75.0,
            imagen:
              'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 18,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Disco SSD 1TB',
            precio: 120.0,
            imagen:
              'https://images.unsplash.com/photo-1597838816882-4435b1977fbe?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 12,
            stockMinimo: 4,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Memoria RAM 16GB',
            precio: 85.0,
            imagen:
              'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 20,
            stockMinimo: 6,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Cargador USB-C Rápido',
            precio: 35.0,
            imagen:
              'https://images.unsplash.com/photo-1583833290214-7a2e3b8c2e5f?auto=format&fit=crop&q=80&w=800',
            categoriaId: electronics.id,
            stock: 30,
            stockMinimo: 10,
            ubicacion: 'Vitrina',
          },
        );
      }

      // 7. Más productos adicionales para Hogar
      if (home) {
        products.push(
          {
            nombre: 'Microondas Digital',
            precio: 180.0,
            imagen:
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 8,
            stockMinimo: 3,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Ventilador de Pedestal',
            precio: 65.0,
            imagen:
              'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 15,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Organizador de Cocina',
            precio: 40.0,
            imagen:
              'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 22,
            stockMinimo: 7,
            ubicacion: 'Vitrina',
          },
          {
            nombre: 'Espejo Decorativo',
            precio: 95.0,
            imagen:
              'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 10,
            stockMinimo: 3,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Alfombra de Sala',
            precio: 150.0,
            imagen:
              'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
            categoriaId: home.id,
            stock: 6,
            stockMinimo: 2,
            ubicacion: 'Bodega A',
          },
        );
      }

      // 8. Más productos adicionales para Deportes
      if (sports) {
        products.push(
          {
            nombre: 'Botella de Agua 1L',
            precio: 18.0,
            imagen:
              'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 40,
            stockMinimo: 12,
            ubicacion: 'Vitrina',
          },
          {
            nombre: 'Bandas de Resistencia',
            precio: 25.0,
            imagen:
              'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 28,
            stockMinimo: 8,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Balón de Baloncesto',
            precio: 40.0,
            imagen:
              'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 22,
            stockMinimo: 6,
            ubicacion: 'Bodega A',
          },
          {
            nombre: 'Rodillo de Espuma',
            precio: 30.0,
            imagen:
              'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 18,
            stockMinimo: 5,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Reloj Deportivo',
            precio: 55.0,
            imagen:
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
            categoriaId: sports.id,
            stock: 14,
            stockMinimo: 4,
            ubicacion: 'Vitrina',
          },
        );
      }

      // 9. Más productos adicionales para Juguetes
      if (toys) {
        products.push(
          {
            nombre: 'Cubo Mágico 3x3',
            precio: 15.0,
            imagen:
              'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 35,
            stockMinimo: 12,
            ubicacion: 'Vitrina',
          },
          {
            nombre: 'Set de Pintura',
            precio: 28.0,
            imagen:
              'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 25,
            stockMinimo: 8,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Drone Mini',
            precio: 180.0,
            imagen:
              'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 8,
            stockMinimo: 3,
            ubicacion: 'Bodega B',
          },
          {
            nombre: 'Set de Instrumentos Musicales',
            precio: 65.0,
            imagen:
              'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 12,
            stockMinimo: 4,
            ubicacion: 'Estante',
          },
          {
            nombre: 'Tren Eléctrico',
            precio: 95.0,
            imagen:
              'https://images.unsplash.com/photo-1558444455-5755107d47bf?auto=format&fit=crop&q=80&w=800',
            categoriaId: toys.id,
            stock: 6,
            stockMinimo: 2,
            ubicacion: 'Bodega A',
          },
        );
      }

      for (const p of products) {
        const product = this.productoRepository.create({
          nombre: p.nombre,
          precio: p.precio,
          imagen: p.imagen,
          categoriaId: p.categoriaId,
        });
        const savedProduct = await this.productoRepository.save(product);

        const inventario = this.inventarioRepository.create({
          stock: p.stock,
          stockMinimo: p.stockMinimo,
          ubicacion: p.ubicacion,
          producto: savedProduct,
        });
        await this.inventarioRepository.save(inventario);

        // Crear log de entrada inicial
        if (p.stock > 0) {
          await this.logRepository.save({
            tipo: 'ENTRADA',
            cantidad: p.stock,
            motivo: 'Stock inicial - creación de producto',
            productoId: savedProduct.id,
          });
        }
      }
      console.log(
        `✅ ${products.length} productos iniciales con inventario y logs creados`,
      );
    }
    console.log('🌱 Seed completed!');
  }
}
