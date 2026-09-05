import { ROLE_VALUES } from '@/types';
import { dbService } from '@/modules/db/db.service';
import { UserController } from '@/modules/user/user.controller';
import { UserEntity } from '@/modules/user/user.entity';
import { ArticleEntity } from '@/modules/article/article.entity';
import { ProfileEntity } from '@/modules/profile/profile.entity';
import { SkillEntity } from '@/modules/skill/skill.entity';
import { ExperienceEntity } from '@/modules/experience/experience.entity';
import { EducationEntity } from '@/modules/education/education.entity';
import { ProjectEntity } from '@/modules/project/project.entity';

export class MigrationService {

  private async createTables() {
    const queries = [
      ...UserEntity.initializeTable(),
      ...ArticleEntity.initializeTable(),
      ...ProfileEntity.initializeTable(),
      ...SkillEntity.initializeTable(),
      ...ExperienceEntity.initializeTable(),
      ...EducationEntity.initializeTable(),
      ...ProjectEntity.initializeTable(),
    ];

    for (const query of queries) {
      await dbService.query(query);
    }

    console.log('All tables and indexes have been migrated.');
  }

  private async createAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
      console.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin creation');
      return;
    }

    // Idempotent: only insert when the admin doesn't already exist.
    // A blind INSERT crashes every boot after the first one
    // (duplicate key on users_email_key).
    const userController = new UserController();
    const existing = await userController.getUserByEmail(adminEmail);
    if (existing) {
      return;
    }

    await userController.createUser({
      email: adminEmail,
      password: adminPassword,
      role: ROLE_VALUES.ADMIN
    })
  }


  async initializeDatabase() {
    try {
      await this.createTables();
      await this.createAdmin();
    } catch (error) {
      console.error('Error during table migration:', error);
    }
  };
}

export const migrationService = new MigrationService();
