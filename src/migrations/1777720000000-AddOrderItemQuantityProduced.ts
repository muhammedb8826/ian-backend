import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemQuantityProduced1777720000000 implements MigrationInterface {
  name = 'AddOrderItemQuantityProduced1777720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`quantityProduced\` float NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`quantityProduced\``);
  }
}
