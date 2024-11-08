import { hash } from 'bcryptjs';
import { Role } from '@/types';
import { dbService } from '@/modules/db/db.service';
import { User, UsersEntity } from '@/modules/user/user.entity';

export class UserRepository {

    async findUserByEmail(email: string): Promise<User | null> {
        const result = await dbService.query(
            `SELECT * FROM ${UsersEntity.tableName} WHERE email = $1`, [email]
        );
        if (result.rows.length) {
            return {
                ...result.rows[0],
                id: String(result.rows[0].id)
            };
        }
        return null;
    }

    async findAll(): Promise<User[]> {
        const result = await dbService.query(`SELECT * FROM ${UsersEntity.tableName}`);
        return result.rows;
    }

    async createUser(user: Partial<User>): Promise<User | null> {
        if (!user.password) {
            return null;
        }

        const hashedPassword = await hash(user.password, 10);
        const role = user.role || Role.User;

        const result = await dbService.query(
            `INSERT INTO ${UsersEntity.tableName} (email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user.email, hashedPassword, role, new Date(), new Date()]
        );

        return {
            ...result.rows[0],
            id: String(result.rows[0].id),
        };
    }
}
