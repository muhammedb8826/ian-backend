import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFilePathTable1752294521815 implements MigrationInterface {
    name = 'AddFilePathTable1752294521815'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`file_path\` (\`id\` varchar(191) NOT NULL, \`filePath\` varchar(191) NOT NULL, \`description\` varchar(191) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8c5c5c5c5c5c5c5c5c5c5c5c5c\` (\`description\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`file_path\``);
    }
} 