import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBaseUomRelation1751842382830 implements MigrationInterface {
    name = 'AddBaseUomRelation1751842382830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_11690dede7681c3c9ec1fd62d08\` FOREIGN KEY (\`baseUomId\`) REFERENCES \`uom\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_11690dede7681c3c9ec1fd62d08\``);
    }

}
