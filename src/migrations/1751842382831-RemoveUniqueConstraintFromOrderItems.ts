import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueConstraintFromOrderItems1751842382831 implements MigrationInterface {
    name = 'RemoveUniqueConstraintFromOrderItems1751842382831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, let's find and drop the foreign key constraints
        const foreignKeys = await queryRunner.query(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'order_items' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
            AND COLUMN_NAME IN ('orderId', 'itemId', 'serviceId')
        `);

        // Drop foreign key constraints
        for (const fk of foreignKeys) {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        }

        // Check if the unique index exists before trying to drop it
        const indexes = await queryRunner.query(`
            SELECT INDEX_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'order_items' 
            AND INDEX_NAME = 'OrderItems_orderId_itemId_serviceId_key'
        `);

        if (indexes.length > 0) {
            // Now drop the unique index
            await queryRunner.query(`DROP INDEX \`OrderItems_orderId_itemId_serviceId_key\` ON \`order_items\``);
        }

        // Re-add the foreign key constraints
        for (const fk of foreignKeys) {
            let referencedColumn = 'id';
            if (fk.REFERENCED_TABLE_NAME === 'orders') referencedColumn = 'id';
            if (fk.REFERENCED_TABLE_NAME === 'items') referencedColumn = 'id';
            if (fk.REFERENCED_TABLE_NAME === 'services') referencedColumn = 'id';

            await queryRunner.query(`
                ALTER TABLE \`order_items\` 
                ADD CONSTRAINT \`${fk.CONSTRAINT_NAME}\` 
                FOREIGN KEY (\`${fk.COLUMN_NAME}\`) 
                REFERENCES \`${fk.REFERENCED_TABLE_NAME}\`(\`${referencedColumn}\`)
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the unique constraint if needed to rollback
        await queryRunner.query(`CREATE UNIQUE INDEX \`OrderItems_orderId_itemId_serviceId_key\` ON \`order_items\`(\`orderId\`, \`itemId\`, \`serviceId\`)`);
    }
}
