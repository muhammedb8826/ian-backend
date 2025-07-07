import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCostPriceToPricing1751803139056 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pricing\` ADD \`costPrice\` float NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP COLUMN \`costPrice\``);
    }

}
