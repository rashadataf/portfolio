import { dbService } from '@/modules/db/db.service';
import { type User, UserEntity } from '@/modules/user/user.entity';
import { toCamelCase } from '@/lib/utils';

export class UserRepository {

    async findUserByEmail(email: string): Promise<User | null> {
        const { rows } = await dbService.query(
            `SELECT * FROM ${UserEntity.tableName} WHERE email = $1`, [email]
        );
        if (rows.length) {
            return toCamelCase<User>(rows[0]);
        }
        return null;
    }

    async findAll(): Promise<User[]> {
        const { rows } = await dbService.query(`SELECT * FROM ${UserEntity.tableName}`);
        return rows.map(row => toCamelCase<User>(row));
    }

    async createUser(user: Partial<User>): Promise<User | null> {

        const { rows } = await dbService.query(
            `INSERT INTO ${UserEntity.tableName} (email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user.email, user.password, user.role, new Date(), new Date()]
        );

        return toCamelCase<User>(rows[0]);
    }
}
