import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddItemPurchasePrice1777800000000 implements MigrationInterface {
  name = 'AddItemPurchasePrice1777800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`items\` ADD \`purchase_price\` float NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`items\` DROP COLUMN \`purchase_price\``);
  }
}
