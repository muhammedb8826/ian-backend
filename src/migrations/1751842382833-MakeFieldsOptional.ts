import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeFieldsOptional1751842382833 implements MigrationInterface {
    name = 'MakeFieldsOptional1751842382833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make address nullable in customers table
        await queryRunner.query(`ALTER TABLE \`customers\` MODIFY \`address\` varchar(255) NULL`);
        
        // Make company, address, reference nullable in vendors table
        await queryRunner.query(`ALTER TABLE \`vendors\` MODIFY \`company\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`vendors\` MODIFY \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`vendors\` MODIFY \`reference\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert address to NOT NULL in customers table
        await queryRunner.query(`ALTER TABLE \`customers\` MODIFY \`address\` varchar(255) NOT NULL`);
        
        // Revert company, address, reference to NOT NULL in vendors table
        await queryRunner.query(`ALTER TABLE \`vendors\` MODIFY \`company\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vendors\` MODIFY \`address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vendors\` MODIFY \`reference\` varchar(255) NOT NULL`);
    }
}
