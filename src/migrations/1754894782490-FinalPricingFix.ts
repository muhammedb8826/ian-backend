import { MigrationInterface, QueryRunner } from "typeorm";

export class FinalPricingFix1754894782490 implements MigrationInterface {
    name = 'FinalPricingFix1754894782490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Final fix for any remaining pricing records with data inconsistencies
        
        // Set isNonStockService = true for records with nonStockServiceId but isNonStockService = false
        await queryRunner.query(`
            UPDATE pricing 
            SET isNonStockService = true 
            WHERE nonStockServiceId IS NOT NULL 
            AND isNonStockService = false
        `);

        // Set isNonStockService = false for records with serviceId but isNonStockService = true
        await queryRunner.query(`
            UPDATE pricing 
            SET isNonStockService = false 
            WHERE serviceId IS NOT NULL 
            AND isNonStockService = true
        `);
    }

    public async down(): Promise<void> {
        // This migration fixes data inconsistencies, so rollback is not straightforward
        console.log('FinalPricingFix migration was reverted. Manual data correction may be needed.');
    }
}

