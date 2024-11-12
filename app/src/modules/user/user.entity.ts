import { Role } from "@/types";

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  static tableName = 'users';

  static UserSchema = {
    id: 'SERIAL PRIMARY KEY',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password: 'VARCHAR(255) NOT NULL',
    role: `VARCHAR(10) DEFAULT '${Role.User}' NOT NULL`,
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  }

  static createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${UserEntity.tableName} (
      id ${this.UserSchema.id},
      email ${this.UserSchema.email},
      password ${this.UserSchema.password},
      role ${this.UserSchema.role},
      created_at ${this.UserSchema.created_at},
      updated_at ${this.UserSchema.updated_at}
    );
  `;

  static initializeTable() {
    return [UserEntity.createTableQuery];
  }
}
