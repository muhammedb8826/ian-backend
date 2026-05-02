import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddItemBom1777721000000 implements MigrationInterface {
  name = 'AddItemBom1777721000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`item_bom\` (\`id\` varchar(36) NOT NULL, \`itemId\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_item_bom_item\` (\`itemId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`item_bom_line\` (\`id\` varchar(36) NOT NULL, \`itemBomId\` varchar(255) NOT NULL, \`sortOrder\` int NOT NULL DEFAULT '0', \`componentItemId\` varchar(255) NOT NULL, \`uomId\` varchar(255) NOT NULL, \`quantityPerUnit\` float NOT NULL, \`standardUnitCost\` float NULL, \`standardUnitSellingPrice\` float NULL, \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_item_bom_line_bom\` (\`itemBomId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item_bom\` ADD CONSTRAINT \`FK_item_bom_item\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item_bom_line\` ADD CONSTRAINT \`FK_item_bom_line_bom\` FOREIGN KEY (\`itemBomId\`) REFERENCES \`item_bom\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item_bom_line\` ADD CONSTRAINT \`FK_item_bom_line_component\` FOREIGN KEY (\`componentItemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item_bom_line\` ADD CONSTRAINT \`FK_item_bom_line_uom\` FOREIGN KEY (\`uomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`item_bom_line\` DROP FOREIGN KEY \`FK_item_bom_line_uom\``);
    await queryRunner.query(`ALTER TABLE \`item_bom_line\` DROP FOREIGN KEY \`FK_item_bom_line_component\``);
    await queryRunner.query(`ALTER TABLE \`item_bom_line\` DROP FOREIGN KEY \`FK_item_bom_line_bom\``);
    await queryRunner.query(`ALTER TABLE \`item_bom\` DROP FOREIGN KEY \`FK_item_bom_item\``);
    await queryRunner.query(`DROP TABLE \`item_bom_line\``);
    await queryRunner.query(`DROP TABLE \`item_bom\``);
  }
}
