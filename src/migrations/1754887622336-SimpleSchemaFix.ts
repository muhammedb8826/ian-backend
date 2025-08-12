import { MigrationInterface, QueryRunner } from "typeorm";

export class SimpleSchemaFix1754887622336 implements MigrationInterface {
    name = 'SimpleSchemaFix1754887622336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if columns already exist before adding them
        const orderItemsColumns = await queryRunner.query(`
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'order_items'
            AND COLUMN_NAME IN ('nonStockServiceId', 'isNonStockService')
        `);
        
        const pricingColumns = await queryRunner.query(`
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'pricing'
            AND COLUMN_NAME IN ('nonStockServiceId', 'isNonStockService')
        `);
        
        // Add non-stock service support to order_items table (only if columns don't exist)
        if (!orderItemsColumns.find(col => col.COLUMN_NAME === 'nonStockServiceId')) {
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`nonStockServiceId\` varchar(36) NULL`);
        }
        if (!orderItemsColumns.find(col => col.COLUMN_NAME === 'isNonStockService')) {
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`isNonStockService\` tinyint NOT NULL DEFAULT 0`);
        }
        
        // Add non-stock service support to pricing table (only if columns don't exist)
        if (!pricingColumns.find(col => col.COLUMN_NAME === 'nonStockServiceId')) {
            await queryRunner.query(`ALTER TABLE \`pricing\` ADD \`nonStockServiceId\` varchar(36) NULL`);
        }
        if (!pricingColumns.find(col => col.COLUMN_NAME === 'isNonStockService')) {
            await queryRunner.query(`ALTER TABLE \`pricing\` ADD \`isNonStockService\` tinyint NOT NULL DEFAULT 0`);
        }
        
        // Check if foreign key constraints already exist before adding them
        const existingConstraints = await queryRunner.query(`
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME IN ('order_items', 'pricing')
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        `);
        
        // Add foreign key constraints for non-stock services (only if they don't exist)
        if (!existingConstraints.find(c => c.CONSTRAINT_NAME === 'FK_order_items_non_stock_service')) {
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_non_stock_service\` FOREIGN KEY (\`nonStockServiceId\`) REFERENCES \`non_stock_services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        if (!existingConstraints.find(c => c.CONSTRAINT_NAME === 'FK_pricing_non_stock_service')) {
            await queryRunner.query(`ALTER TABLE \`pricing\` ADD CONSTRAINT \`FK_pricing_non_stock_service\` FOREIGN KEY (\`nonStockServiceId\`) REFERENCES \`non_stock_services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints for non-stock services
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP FOREIGN KEY \`FK_pricing_non_stock_service\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_non_stock_service\``);
        
        // Remove columns from pricing table
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP COLUMN \`isNonStockService\``);
        await queryRunner.query(`ALTER TABLE \`pricing\` DROP COLUMN \`nonStockServiceId\``);
        
        // Remove columns from order_items table
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`isNonStockService\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`nonStockServiceId\``);
    }
}
