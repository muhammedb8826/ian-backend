import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueEmailConstraints1751842382832 implements MigrationInterface {
    name = 'RemoveUniqueEmailConstraints1751842382832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and drop unique index on customers email if it exists
        const customerEmailIndexes = await queryRunner.query(`
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = 'ian_backend' 
            AND TABLE_NAME = 'customers' 
            AND COLUMN_NAME = 'email' 
            AND NON_UNIQUE = 0
        `);
        
        if (customerEmailIndexes.length > 0) {
            for (const index of customerEmailIndexes) {
                await queryRunner.query(`DROP INDEX \`${index.INDEX_NAME}\` ON \`customers\``);
            }
        }
        
        // Check and drop unique index on vendors email if it exists
        const vendorEmailIndexes = await queryRunner.query(`
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = 'ian_backend' 
            AND TABLE_NAME = 'vendors' 
            AND COLUMN_NAME = 'email' 
            AND NON_UNIQUE = 0
        `);
        
        if (vendorEmailIndexes.length > 0) {
            for (const index of vendorEmailIndexes) {
                await queryRunner.query(`DROP INDEX \`${index.INDEX_NAME}\` ON \`vendors\``);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate unique index on customers email
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_customers_email\` ON \`customers\` (\`email\`)`);
        
        // Recreate unique index on vendors email
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_vendors_email\` ON \`vendors\` (\`email\`)`);
    }
}
