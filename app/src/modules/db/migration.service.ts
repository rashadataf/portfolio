import { Role } from '@/types';
import { dbService } from '@/modules/db/db.service';
import { UserController } from '@/modules/user/user.controller';
import { UsersEntity } from '@/modules/user/user.entity';

export class MigrationService {

  async createTables() {
    const queries = [
      ...UsersEntity.initializeTable(),
    ];

    for (const query of queries) {
      await dbService.query(query);
    }

    console.log('All tables and indexes have been migrated.');
  }

  async createAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    const userController = new UserController();
    await userController.createUser({
      email: adminEmail,
      password: adminPassword,
      role: Role.Admin
    })
  }


  async initializeDatabase() {
    try {
      await this.createTables();
      await this.createAdmin();
    } catch (error) {
      console.error('Error during table migration:', error);
      process.exit(1);
    }
  };
}

export const migrationService = new MigrationService();
