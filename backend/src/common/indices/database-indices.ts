import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddDatabaseIndices1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Índices para productos
    await queryRunner.createIndex(
      'productos',
      new TableIndex({
        name: 'IDX_PRODUCTOS_NOMBRE',
        columnNames: ['nombre'],
      }),
    );
    await queryRunner.createIndex(
      'productos',
      new TableIndex({
        name: 'IDX_PRODUCTOS_PRECIO',
        columnNames: ['precio'],
      }),
    );
    await queryRunner.createIndex(
      'productos',
      new TableIndex({
        name: 'IDX_PRODUCTOS_CATEGORIA',
        columnNames: ['categoriaId'],
      }),
    );

    // Índices para inventario_logs
    await queryRunner.createIndex(
      'inventario_logs',
      new TableIndex({
        name: 'IDX_LOGS_FECHA',
        columnNames: ['fecha'],
      }),
    );
    await queryRunner.createIndex(
      'inventario_logs',
      new TableIndex({
        name: 'IDX_LOGS_PRODUCTO',
        columnNames: ['productoId'],
      }),
    );
    await queryRunner.createIndex(
      'inventario_logs',
      new TableIndex({
        name: 'IDX_LOGS_TIPO',
        columnNames: ['tipo'],
      }),
    );

    // Índices para ventas
    await queryRunner.createIndex(
      'ventas',
      new TableIndex({
        name: 'IDX_VENTAS_FECHA',
        columnNames: ['fechaVenta'],
      }),
    );
    await queryRunner.createIndex(
      'ventas',
      new TableIndex({
        name: 'IDX_VENTAS_VENDEDOR',
        columnNames: ['vendedorId'],
      }),
    );
    await queryRunner.createIndex(
      'ventas',
      new TableIndex({
        name: 'IDX_VENTAS_ESTADO',
        columnNames: ['estado'],
      }),
    );

    // Índices para notificaciones
    await queryRunner.createIndex(
      'notificaciones',
      new TableIndex({
        name: 'IDX_NOTIFICACIONES_USUARIO',
        columnNames: ['usuarioId'],
      }),
    );
    await queryRunner.createIndex(
      'notificaciones',
      new TableIndex({
        name: 'IDX_NOTIFICACIONES_LEIDA',
        columnNames: ['leida'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('productos', 'IDX_PRODUCTOS_NOMBRE');
    await queryRunner.dropIndex('productos', 'IDX_PRODUCTOS_PRECIO');
    await queryRunner.dropIndex('productos', 'IDX_PRODUCTOS_CATEGORIA');
    await queryRunner.dropIndex('inventario_logs', 'IDX_LOGS_FECHA');
    await queryRunner.dropIndex('inventario_logs', 'IDX_LOGS_PRODUCTO');
    await queryRunner.dropIndex('inventario_logs', 'IDX_LOGS_TIPO');
    await queryRunner.dropIndex('ventas', 'IDX_VENTAS_FECHA');
    await queryRunner.dropIndex('ventas', 'IDX_VENTAS_VENDEDOR');
    await queryRunner.dropIndex('ventas', 'IDX_VENTAS_ESTADO');
    await queryRunner.dropIndex('notificaciones', 'IDX_NOTIFICACIONES_USUARIO');
    await queryRunner.dropIndex('notificaciones', 'IDX_NOTIFICACIONES_LEIDA');
  }
}
