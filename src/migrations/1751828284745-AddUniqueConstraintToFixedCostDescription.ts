import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToFixedCostDescription1751828284745 implements MigrationInterface {
    name = 'AddUniqueConstraintToFixedCostDescription1751828284745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`ALTER TABLE \`fixed_cost\` ADD UNIQUE INDEX \`IDX_fixed_cost_description_unique\` (\`description\`)`);
        } catch (error) {
            // If index already exists, ignore the error
            if (error.code !== 'ER_DUP_KEYNAME') {
                throw error;
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`ALTER TABLE \`fixed_cost\` DROP INDEX \`IDX_fixed_cost_description_unique\``);
        } catch (error) {
            // If index doesn't exist, ignore the error
            if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
                throw error;
            }
        }
    }

}
