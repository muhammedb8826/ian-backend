import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddItemBomLineDimensions1777722000000 implements MigrationInterface {
  name = 'AddItemBomLineDimensions1777722000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`item_bom_line\` ADD \`width\` float NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item_bom_line\` ADD \`height\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`item_bom_line\` DROP COLUMN \`height\``);
    await queryRunner.query(`ALTER TABLE \`item_bom_line\` DROP COLUMN \`width\``);
  }
}
