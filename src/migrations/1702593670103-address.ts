import {MigrationInterface, QueryRunner} from "typeorm";

export class address1702593670103 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "address" ADD "customFieldsNip" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "customFieldsNip"`, undefined);
   }

}
