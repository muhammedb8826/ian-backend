import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemPrintQcDeliveryAndEvents1777723000000 implements MigrationInterface {
  name = 'AddOrderItemPrintQcDeliveryAndEvents1777723000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`quantityPrinted\` float NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`quantityQualityControlled\` float NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`quantityDelivered\` float NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(`
      CREATE TABLE \`order_item_events\` (
        \`id\` varchar(36) NOT NULL,
        \`orderItemId\` varchar(255) NOT NULL,
        \`type\` varchar(32) NOT NULL,
        \`quantity\` float NOT NULL,
        \`note\` varchar(255) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(
      `ALTER TABLE \`order_item_events\` ADD CONSTRAINT \`FK_order_item_events_order_items\` FOREIGN KEY (\`orderItemId\`) REFERENCES \`order_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`order_item_events\` DROP FOREIGN KEY \`FK_order_item_events_order_items\``);
    await queryRunner.query(`DROP TABLE \`order_item_events\``);

    await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`quantityDelivered\``);
    await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`quantityQualityControlled\``);
    await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`quantityPrinted\``);
  }
}

