import { Pool } from 'pg';

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    this.pool.on('connect', () => {
      console.log('Connected to PostgreSQL DB');
    });

    this.pool.on('error', (error) => {
      console.error('Error with PostgreSQL Pool:', error);
    });
  }

  async query(text: string, params?: unknown[]) {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.pool.end();
      console.log('Disconnected from PostgreSQL DB');
    } catch (error) {
      console.error('Error disconnecting from PostgreSQL:', error);
      throw error;
    }
  }
}

export const dbService = new DatabaseService();
