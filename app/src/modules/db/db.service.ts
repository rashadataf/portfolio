import { Pool, type PoolConfig } from 'pg';
// NOTE: import from shutdown-state (Edge-safe), NOT graceful-shutdown.
// db.service is indirectly bundled into Edge Middleware via the
// auth -> user.controller -> db.service chain; graceful-shutdown uses
// Node-only process signal APIs that break the Edge build.
import { registerShutdownHandler, isHealthy } from '@/lib/shutdown-state';
import { logger } from '@/lib/logger';

declare global {
  var __dbServiceConnectLogged: boolean | undefined;
}

class DatabaseService {
  private pool: Pool;
  private isConnected = false;

  constructor() {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      // Connection pool settings for production
      max: parseInt(process.env.DB_POOL_MAX || "20", 10),
      min: parseInt(process.env.DB_POOL_MIN || "2", 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000", 10),
      // Allow retry on connection failure
      allowExitOnIdle: true,
    };

    this.pool = new Pool(config);

    // Only attach the connect logger once across HMR/dev reloads
    if (!globalThis.__dbServiceConnectLogged) {
      this.pool.on('connect', () => {
        logger.info('Connected to PostgreSQL DB');
        globalThis.__dbServiceConnectLogged = true;
        this.isConnected = true;
      });
    }

    this.pool.on('error', (error) => {
      logger.error('Error with PostgreSQL Pool', { error: error.message });
      this.isConnected = false;
    });

    this.pool.on('remove', () => {
      this.isConnected = this.pool.totalCount > 0;
    });

    // Register cleanup handler for graceful shutdown (Edge-safe).
    // The actual signal handling is set up in instrumentation.ts (Node only).
    registerShutdownHandler(async () => {
      await this.disconnect();
    });
  }

  async query(text: string, params?: unknown[]) {
    if (!isHealthy()) {
      throw new Error('Database is shutting down');
    }
    
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Database query executed', { 
        durationMs: duration,
        rowCount: result.rowCount 
      });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Error executing query', { 
        error: (error as Error).message,
        durationMs: duration,
        query: text.substring(0, 100) // Log first 100 chars of query
      });
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Disconnected from PostgreSQL DB');
    } catch (error) {
      logger.error('Error disconnecting from PostgreSQL', { error: (error as Error).message });
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  // Get pool stats for monitoring
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  isReady(): boolean {
    return this.isConnected && isHealthy();
  }
}

export const dbService = new DatabaseService();
