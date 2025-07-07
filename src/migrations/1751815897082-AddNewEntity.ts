import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewEntity1751815897082 implements MigrationInterface {
    name = 'AddNewEntity1751815897082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`fixed_cost\` (\`id\` varchar(36) NOT NULL, \`monthlyFixedCost\` float NOT NULL, \`dailyFixedCost\` float NOT NULL, \`description\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`fixed_cost\``);
    }

}
