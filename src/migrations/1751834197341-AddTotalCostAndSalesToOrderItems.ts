import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalCostAndSalesToOrderItems1751834197341 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`totalCost\` float NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`sales\` float NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`sales\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`totalCost\``);
    }

}
