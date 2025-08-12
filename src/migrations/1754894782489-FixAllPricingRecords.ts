import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAllPricingRecords1754894782489 implements MigrationInterface {
    name = 'FixAllPricingRecords1754894782489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix all pricing records with data inconsistencies
        
        // 1. Set isNonStockService = true for records with nonStockServiceId but isNonStockService = false
        await queryRunner.query(`
            UPDATE pricing 
            SET isNonStockService = true 
            WHERE nonStockServiceId IS NOT NULL 
            AND isNonStockService = false
        `);

        // 2. Set isNonStockService = false for records with serviceId but isNonStockService = true
        await queryRunner.query(`
            UPDATE pricing 
            SET isNonStockService = false 
            WHERE serviceId IS NOT NULL 
            AND isNonStockService = true
        `);

        // 3. Ensure records with nonStockServiceId have serviceId = NULL
        await queryRunner.query(`
            UPDATE pricing 
            SET serviceId = NULL 
            WHERE nonStockServiceId IS NOT NULL 
            AND serviceId IS NOT NULL
        `);

        // 4. Ensure records with serviceId have nonStockServiceId = NULL
        await queryRunner.query(`
            UPDATE pricing 
            SET nonStockServiceId = NULL 
            WHERE serviceId IS NOT NULL 
            AND nonStockServiceId IS NOT NULL
        `);
    }

    public async down(): Promise<void> {
        // This migration fixes data inconsistencies, so rollback is not straightforward
        // We'll just log that this migration was reverted
        console.log('FixAllPricingRecords migration was reverted. Manual data correction may be needed.');
    }
}
