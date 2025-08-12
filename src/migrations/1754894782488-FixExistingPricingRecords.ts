import { MigrationInterface, QueryRunner } from "typeorm";

export class FixExistingPricingRecords1754894782488 implements MigrationInterface {
    name = 'FixExistingPricingRecords1754894782488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update all pricing records that have nonStockServiceId populated but isNonStockService is false
        // This fixes the data inconsistency for existing pricing records created before non-stock service support
        await queryRunner.query(`
            UPDATE pricing 
            SET isNonStockService = true 
            WHERE nonStockServiceId IS NOT NULL 
            AND isNonStockService = false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes if needed
        await queryRunner.query(`
            UPDATE pricing 
            SET isNonStockService = false 
            WHERE nonStockServiceId IS NOT NULL 
            AND isNonStockService = true
        `);
    }
}
