import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContentToSongs1779466800000 implements MigrationInterface {
  name = 'AddContentToSongs1779466800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "content" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "content"`);
  }
}
