import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './usuarios/entities/usuario.entity';
import { RoleEntity } from './modules/rol/entities/role.entitity';
import { ProductoEntity } from './productos/entities/producto.entity';
import { CategoriaEntity } from './categoria/entities/categoria.entity';
import { InventarioEntity } from './inventario/entities/inventario.entity';
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
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('🌱 Starting Seed...');

    // 1. Crear Roles
    let adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' as any },
    });
    if (!adminRole) {
      adminRole = await this.roleRepository.save({ name: 'admin' as any });
    }

    let userRole = await this.roleRepository.findOne({
      where: { name: 'user' as any },
    });
    if (!userRole) {
      userRole = await this.roleRepository.save({ name: 'user' as any });
    }

    // 2. Crear Usuario Admin
    const adminEmail = 'admin@email.com';
    const exists = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!exists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.userRepository.save({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: adminRole,
        roleId: adminRole.id,
      });
      console.log('✅ Usuario admin creado');
    }

    // 3. Crear Categorías
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
          ubicacion: p.ubicacion as any,
          producto: savedProduct,
        });
        await this.inventarioRepository.save(inventario);
      }
      console.log(
        `✅ ${products.length} productos iniciales con inventario creados`,
      );
    }
    console.log('🌱 Seed completed!');
  }
}
