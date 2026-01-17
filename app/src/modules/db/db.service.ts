import { Pool } from 'pg';

declare global {
  var __dbServiceConnectLogged: boolean | undefined;
}

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Only attach the connect logger once across HMR/dev reloads
    if (!globalThis.__dbServiceConnectLogged) {
      this.pool.on('connect', () => {
        console.log('Connected to PostgreSQL DB');
        globalThis.__dbServiceConnectLogged = true;
      });
    }

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
