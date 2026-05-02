import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemComponents1777719600000 implements MigrationInterface {
  name = 'AddOrderItemComponents1777719600000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`order_item_components\` (\`id\` varchar(36) NOT NULL, \`orderItemId\` varchar(255) NOT NULL, \`itemId\` varchar(255) NOT NULL, \`uomId\` varchar(255) NOT NULL, \`quantity\` float NOT NULL, \`unitCost\` float NOT NULL, \`unitSellingPrice\` float NULL, \`totalCost\` float NOT NULL, \`description\` varchar(255) NULL, \`notes\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_order_item_components_order_item\` (\`orderItemId\`), INDEX \`IDX_order_item_components_item\` (\`itemId\`), INDEX \`IDX_order_item_components_uom\` (\`uomId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`ALTER TABLE \`order_item_components\` ADD CONSTRAINT \`FK_order_item_components_order_item\` FOREIGN KEY (\`orderItemId\`) REFERENCES \`order_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`order_item_components\` ADD CONSTRAINT \`FK_order_item_components_item\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`order_item_components\` ADD CONSTRAINT \`FK_order_item_components_uom\` FOREIGN KEY (\`uomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`order_item_components\` DROP FOREIGN KEY \`FK_order_item_components_uom\``);
    await queryRunner.query(`ALTER TABLE \`order_item_components\` DROP FOREIGN KEY \`FK_order_item_components_item\``);
    await queryRunner.query(`ALTER TABLE \`order_item_components\` DROP FOREIGN KEY \`FK_order_item_components_order_item\``);
    await queryRunner.query(`DROP INDEX \`IDX_order_item_components_uom\` ON \`order_item_components\``);
    await queryRunner.query(`DROP INDEX \`IDX_order_item_components_item\` ON \`order_item_components\``);
    await queryRunner.query(`DROP INDEX \`IDX_order_item_components_order_item\` ON \`order_item_components\``);
    await queryRunner.query(`DROP TABLE \`order_item_components\``);
  }
}
