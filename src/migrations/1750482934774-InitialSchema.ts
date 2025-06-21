import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1750482934774 implements MigrationInterface {
    name = 'InitialSchema1750482934774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pricing\` ADD CONSTRAINT \`FK_bd8c383aa0df97a834c3fc77e83\` FOREIGN KEY (\`baseUomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pricing\` ADD CONSTRAINT \`FK_22aa7ee9e019f4f8bf61920da8c\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pricing\` ADD CONSTRAINT \`FK_420e1792e18656a1d66a20bab0c\` FOREIGN KEY (\`serviceId\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_e253fbd572683bcc785a70cbca7\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_2a8ce0dd0205df008b9e2f09206\` FOREIGN KEY (\`serviceId\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`discounts\` ADD CONSTRAINT \`FK_bd1d07c0a61acb7b03cc195509a\` FOREIGN KEY (\`itemId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_595a0c1018faf8f48c1ce36a280\` FOREIGN KEY (\`defaultUomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_9a4ea23f9a8c1e130d7d4c1ddad\` FOREIGN KEY (\`machineId\`) REFERENCES \`machine\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_c59291c396d452f0c8e419d3e38\` FOREIGN KEY (\`purchaseUomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_629d91468f5a76f4472c4909261\` FOREIGN KEY (\`unitCategoryId\`) REFERENCES \`unit_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`attribute\` ADD CONSTRAINT \`FK_3f57f0a2bd5fad53d34f1df877f\` FOREIGN KEY (\`itemsId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`services_items_items\` ADD CONSTRAINT \`FK_11e5c165b1866e0fe5dc2f5b178\` FOREIGN KEY (\`servicesId\`) REFERENCES \`services\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`services_items_items\` ADD CONSTRAINT \`FK_8d2d12b6b68b9da0d23b9aa72e3\` FOREIGN KEY (\`itemsId\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`items_services_services\` ADD CONSTRAINT \`FK_0af7ef64c6038062e767574dc88\` FOREIGN KEY (\`itemsId\`) REFERENCES \`items\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`items_services_services\` ADD CONSTRAINT \`FK_d7864f4f5e2917fc23a6178ba73\` FOREIGN KEY (\`servicesId\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`items_services_services\` DROP FOREIGN KEY \`FK_d7864f4f5e2917fc23a6178ba73\``);
        await queryRunner.query(`ALTER TABLE \`items_services_services\` DROP FOREIGN KEY \`FK_0af7ef64c6038062e767574dc88\``);
        await queryRunner.query(`ALTER TABLE \`services_items_items\` DROP FOREIGN KEY \`FK_8d2d12b6b68b9da0d23b9aa72e3\``);
        await queryRunner.query(`ALTER TABLE \`services_items_items\` DROP FOREIGN KEY \`FK_11e5c165b1866e0fe5dc2f5b178\``);
        await queryRunner.query(`ALTER TABLE \`attribute\` DROP FOREIGN KEY \`FK_3f57f0a2bd5fad53d34f1df877f\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_629d91468f5a76f4472c4909261\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_c59291c396d452f0c8e419d3e38\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_9a4ea23f9a8c1e130d7d4c1ddad\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_595a0c1018faf8f48c1ce36a280\``);
        await queryRunner.query(`ALTER TABLE \`discounts\` DROP FOREIGN KEY \`FK_bd1d07c0a61acb7b03cc195509a\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_2a8ce0dd0205df008b9e2f09206\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_e253fbd572683bcc785a70cbca7\``);
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP FOREIGN KEY \`FK_420e1792e18656a1d66a20bab0c\``);
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP FOREIGN KEY \`FK_22aa7ee9e019f4f8bf61920da8c\``);
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP FOREIGN KEY \`FK_bd8c383aa0df97a834c3fc77e83\``);
    }

}
