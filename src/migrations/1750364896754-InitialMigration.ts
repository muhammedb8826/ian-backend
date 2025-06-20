import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1750364896754 implements MigrationInterface {
    name = 'InitialMigration1750364896754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`passwordRT\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`address\` varchar(255) NOT NULL, \`first_name\` varchar(255) NULL, \`gender\` varchar(255) NOT NULL DEFAULT 'MALE', \`last_name\` varchar(255) NULL, \`middle_name\` varchar(255) NULL, \`phone\` varchar(255) NOT NULL, \`profile\` varchar(255) NULL, \`roles\` enum ('USER', 'ADMIN', 'RECEPTION', 'GRAPHIC_DESIGNER', 'OPERATOR', 'FINANCE', 'STORE_REPRESENTATIVE', 'PURCHASER') NOT NULL DEFAULT 'ADMIN', \`confirm_password\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`machines\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`status\` tinyint NOT NULL DEFAULT 1, \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_005481cad20f051f1ea2126bc0\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_machine\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`machineId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_af72a60760d2af7032bae47e7b\` (\`userId\`, \`machineId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`services\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`status\` tinyint NOT NULL DEFAULT 1, \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_019d74f7abcdcb5a0113010cb0\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`unit_category\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`constant\` tinyint NOT NULL, \`constantValue\` float NOT NULL, UNIQUE INDEX \`IDX_0f1d312e5d4ae66ad45b76e0a1\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`uom\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`abbreviation\` varchar(255) NOT NULL, \`conversionRate\` float NOT NULL, \`baseUnit\` tinyint NOT NULL DEFAULT 0, \`unitCategoryId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_0246fd4beee9bba40f4018bbcf\` (\`name\`, \`abbreviation\`, \`unitCategoryId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`items\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`reorder_level\` int NOT NULL, \`initial_stock\` int NOT NULL, \`updated_initial_stock\` int NOT NULL, \`machineId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`can_be_purchased\` tinyint NOT NULL DEFAULT 1, \`can_be_sold\` tinyint NOT NULL DEFAULT 1, \`quantity\` int NOT NULL, \`unitCategoryId\` varchar(255) NULL, \`defaultUomId\` varchar(255) NULL, \`purchaseUomId\` varchar(255) NULL, UNIQUE INDEX \`IDX_213736582899b3599acaade2cd\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pricing\` (\`id\` varchar(36) NOT NULL, \`itemId\` varchar(255) NOT NULL, \`serviceId\` varchar(255) NOT NULL, \`sellingPrice\` float NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`constant\` tinyint NOT NULL DEFAULT 0, \`height\` float NULL, \`width\` float NULL, \`baseUomId\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_5043096f6a2160a7507f1dbc19\` (\`itemId\`, \`serviceId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vendors\` (\`id\` varchar(36) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NOT NULL, \`company\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`reference\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e1f64c741c359e588122ec92a6\` (\`fullName\`), UNIQUE INDEX \`IDX_3fe1343dbf2a7d9b7be1c27725\` (\`email\`), UNIQUE INDEX \`IDX_67ab49bf11bb8ca309d54e5449\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`purchases\` (\`id\` varchar(36) NOT NULL, \`series\` varchar(255) NOT NULL, \`vendorId\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`orderDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`paymentMethod\` varchar(255) NOT NULL, \`amount\` float NOT NULL, \`reference\` varchar(255) NOT NULL, \`totalAmount\` float NOT NULL, \`totalQuantity\` int NOT NULL, \`note\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`purchaserId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`purchase_items\` (\`id\` varchar(36) NOT NULL, \`purchaseId\` varchar(255) NOT NULL, \`itemId\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`unitPrice\` float NOT NULL, \`amount\` float NOT NULL, \`description\` varchar(255) NULL, \`status\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`uomId\` varchar(255) NOT NULL, \`baseUomId\` varchar(255) NOT NULL, \`unit\` float NOT NULL, UNIQUE INDEX \`IDX_b51a9c31b0f4f07ed2ac39ef27\` (\`purchaseId\`, \`itemId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sales\` (\`id\` varchar(36) NOT NULL, \`series\` varchar(255) NOT NULL, \`operatorId\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`orderDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`note\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`totalQuantity\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sale_items\` (\`id\` varchar(36) NOT NULL, \`saleId\` varchar(255) NOT NULL, \`itemId\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`description\` varchar(255) NULL, \`status\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`uomId\` varchar(255) NOT NULL, \`baseUomId\` varchar(255) NOT NULL, \`unit\` float NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`customers\` (\`id\` varchar(36) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`email\` varchar(255) NULL, \`phone\` varchar(255) NOT NULL, \`company\` varchar(255) NULL, \`address\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8536b8b85c06969f84f0c098b0\` (\`email\`), UNIQUE INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` varchar(36) NOT NULL, \`series\` varchar(255) NOT NULL, \`customerId\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`orderDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deliveryDate\` datetime NOT NULL, \`totalAmount\` float NOT NULL, \`tax\` float NOT NULL, \`grandTotal\` float NOT NULL, \`totalQuantity\` int NOT NULL, \`internalNote\` varchar(255) NULL, \`paymentTermId\` varchar(255) NULL, \`commissionId\` varchar(255) NULL, \`fileNames\` text NOT NULL, \`adminApproval\` tinyint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`salesPartnersId\` varchar(255) NULL, \`orderSource\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` varchar(36) NOT NULL, \`orderId\` varchar(255) NOT NULL, \`itemId\` varchar(255) NOT NULL, \`serviceId\` varchar(255) NOT NULL, \`width\` float NULL, \`height\` float NULL, \`discount\` float NULL, \`level\` int NOT NULL, \`totalAmount\` float NOT NULL, \`adminApproval\` tinyint NOT NULL, \`uomId\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`unitPrice\` float NOT NULL, \`description\` varchar(255) NULL, \`status\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`isDiscounted\` tinyint NOT NULL, \`pricingId\` varchar(255) NOT NULL, \`baseUomId\` varchar(255) NOT NULL, \`unit\` float NOT NULL, UNIQUE INDEX \`IDX_29a7b6ada82d4f18dab6e241ea\` (\`orderId\`, \`itemId\`, \`serviceId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_machine\` ADD CONSTRAINT \`FK_7f74ce92adc1bdbd3e525fbe8b7\` FOREIGN KEY (\`machineId\`) REFERENCES \`machines\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_machine\` ADD CONSTRAINT \`FK_531514348ce1804ff125735acbc\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`uom\` ADD CONSTRAINT \`FK_999937e80f724f5a108f45af7bf\` FOREIGN KEY (\`unitCategoryId\`) REFERENCES \`unit_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_9a4ea23f9a8c1e130d7d4c1ddad\` FOREIGN KEY (\`machineId\`) REFERENCES \`machines\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_629d91468f5a76f4472c4909261\` FOREIGN KEY (\`unitCategoryId\`) REFERENCES \`unit_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_595a0c1018faf8f48c1ce36a280\` FOREIGN KEY (\`defaultUomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_c59291c396d452f0c8e419d3e38\` FOREIGN KEY (\`purchaseUomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pricing\` ADD CONSTRAINT \`FK_22aa7ee9e019f4f8bf61920da8c\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pricing\` ADD CONSTRAINT \`FK_420e1792e18656a1d66a20bab0c\` FOREIGN KEY (\`serviceId\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pricing\` ADD CONSTRAINT \`FK_bd8c383aa0df97a834c3fc77e83\` FOREIGN KEY (\`baseUomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_780f48bc261cf77f68e27fbc38a\` FOREIGN KEY (\`purchaserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_ad30f79875fb64a6de23763bf42\` FOREIGN KEY (\`vendorId\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_684a9853855f5edcd905dc2a9a8\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_8bafbb5d45827a5d25f5cd3c6f3\` FOREIGN KEY (\`purchaseId\`) REFERENCES \`purchases\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` ADD CONSTRAINT \`FK_b7b4a9fd8cc9efa37d2488084bc\` FOREIGN KEY (\`uomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sales\` ADD CONSTRAINT \`FK_bcfd467aaf89ac96018400368b7\` FOREIGN KEY (\`operatorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sale_items\` ADD CONSTRAINT \`FK_a22cb8ff5a4d3709da216b11610\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sale_items\` ADD CONSTRAINT \`FK_c642be08de5235317d4cf3deb40\` FOREIGN KEY (\`saleId\`) REFERENCES \`sales\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sale_items\` ADD CONSTRAINT \`FK_e6f608e57a5ea871bbec9aa3521\` FOREIGN KEY (\`uomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_e5de51ca888d8b1f5ac25799dd1\` FOREIGN KEY (\`customerId\`) REFERENCES \`customers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_e253fbd572683bcc785a70cbca7\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_8c20bd83ab9df432718c8fe959d\` FOREIGN KEY (\`pricingId\`) REFERENCES \`pricing\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9de9472d1a87fd106634222c1b8\` FOREIGN KEY (\`uomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_2a8ce0dd0205df008b9e2f09206\` FOREIGN KEY (\`serviceId\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_2a8ce0dd0205df008b9e2f09206\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9de9472d1a87fd106634222c1b8\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_8c20bd83ab9df432718c8fe959d\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_e253fbd572683bcc785a70cbca7\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_e5de51ca888d8b1f5ac25799dd1\``);
        await queryRunner.query(`ALTER TABLE \`sale_items\` DROP FOREIGN KEY \`FK_e6f608e57a5ea871bbec9aa3521\``);
        await queryRunner.query(`ALTER TABLE \`sale_items\` DROP FOREIGN KEY \`FK_c642be08de5235317d4cf3deb40\``);
        await queryRunner.query(`ALTER TABLE \`sale_items\` DROP FOREIGN KEY \`FK_a22cb8ff5a4d3709da216b11610\``);
        await queryRunner.query(`ALTER TABLE \`sales\` DROP FOREIGN KEY \`FK_bcfd467aaf89ac96018400368b7\``);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_b7b4a9fd8cc9efa37d2488084bc\``);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_8bafbb5d45827a5d25f5cd3c6f3\``);
        await queryRunner.query(`ALTER TABLE \`purchase_items\` DROP FOREIGN KEY \`FK_684a9853855f5edcd905dc2a9a8\``);
        await queryRunner.query(`ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_ad30f79875fb64a6de23763bf42\``);
        await queryRunner.query(`ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_780f48bc261cf77f68e27fbc38a\``);
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP FOREIGN KEY \`FK_bd8c383aa0df97a834c3fc77e83\``);
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP FOREIGN KEY \`FK_420e1792e18656a1d66a20bab0c\``);
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP FOREIGN KEY \`FK_22aa7ee9e019f4f8bf61920da8c\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_c59291c396d452f0c8e419d3e38\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_595a0c1018faf8f48c1ce36a280\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_629d91468f5a76f4472c4909261\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_9a4ea23f9a8c1e130d7d4c1ddad\``);
        await queryRunner.query(`ALTER TABLE \`uom\` DROP FOREIGN KEY \`FK_999937e80f724f5a108f45af7bf\``);
        await queryRunner.query(`ALTER TABLE \`user_machine\` DROP FOREIGN KEY \`FK_531514348ce1804ff125735acbc\``);
        await queryRunner.query(`ALTER TABLE \`user_machine\` DROP FOREIGN KEY \`FK_7f74ce92adc1bdbd3e525fbe8b7\``);
        await queryRunner.query(`DROP INDEX \`IDX_29a7b6ada82d4f18dab6e241ea\` ON \`order_items\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` ON \`customers\``);
        await queryRunner.query(`DROP INDEX \`IDX_8536b8b85c06969f84f0c098b0\` ON \`customers\``);
        await queryRunner.query(`DROP TABLE \`customers\``);
        await queryRunner.query(`DROP TABLE \`sale_items\``);
        await queryRunner.query(`DROP TABLE \`sales\``);
        await queryRunner.query(`DROP INDEX \`IDX_b51a9c31b0f4f07ed2ac39ef27\` ON \`purchase_items\``);
        await queryRunner.query(`DROP TABLE \`purchase_items\``);
        await queryRunner.query(`DROP TABLE \`purchases\``);
        await queryRunner.query(`DROP INDEX \`IDX_67ab49bf11bb8ca309d54e5449\` ON \`vendors\``);
        await queryRunner.query(`DROP INDEX \`IDX_3fe1343dbf2a7d9b7be1c27725\` ON \`vendors\``);
        await queryRunner.query(`DROP INDEX \`IDX_e1f64c741c359e588122ec92a6\` ON \`vendors\``);
        await queryRunner.query(`DROP TABLE \`vendors\``);
        await queryRunner.query(`DROP INDEX \`IDX_5043096f6a2160a7507f1dbc19\` ON \`pricing\``);
        await queryRunner.query(`DROP TABLE \`pricing\``);
        await queryRunner.query(`DROP INDEX \`IDX_213736582899b3599acaade2cd\` ON \`items\``);
        await queryRunner.query(`DROP TABLE \`items\``);
        await queryRunner.query(`DROP INDEX \`IDX_0246fd4beee9bba40f4018bbcf\` ON \`uom\``);
        await queryRunner.query(`DROP TABLE \`uom\``);
        await queryRunner.query(`DROP INDEX \`IDX_0f1d312e5d4ae66ad45b76e0a1\` ON \`unit_category\``);
        await queryRunner.query(`DROP TABLE \`unit_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_019d74f7abcdcb5a0113010cb0\` ON \`services\``);
        await queryRunner.query(`DROP TABLE \`services\``);
        await queryRunner.query(`DROP INDEX \`IDX_af72a60760d2af7032bae47e7b\` ON \`user_machine\``);
        await queryRunner.query(`DROP TABLE \`user_machine\``);
        await queryRunner.query(`DROP INDEX \`IDX_005481cad20f051f1ea2126bc0\` ON \`machines\``);
        await queryRunner.query(`DROP TABLE \`machines\``);
        await queryRunner.query(`DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
