import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentParentFK1767937416819 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`comment\` 
        ADD CONSTRAINT \`FK_8bd8d0985c0d077c8129fb4a209\` 
        FOREIGN KEY (\`parent_id\`) 
        REFERENCES \`comment\`(\`id\`) 
        ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`comment\` 
        DROP FOREIGN KEY \`FK_8bd8d0985c0d077c8129fb4a209\`
    `);
  }
}
