// Graceful shutdown signal handling for Docker containers (Node.js only).
//
// IMPORTANT: This module uses Node-only APIs (process.on/off) and must NEVER
// be statically imported by code that ends up in the Edge runtime
// (middleware, edge instrumentation). It is dynamically imported from
// instrumentation.ts (nodejs branch) only.
//
// Edge-safe state and the handler registry live in shutdown-state.ts.

import { logger } from './logger';
import {
  getShutdownHandlers,
  isHealthy,
  setShuttingDown,
} from './shutdown-state';

export function setupGracefulShutdown(
  onShutdown: () => Promise<void> | void
): () => void {
  const shutdown = async (signal: string) => {
    if (!isHealthy()) {
      logger.warn(`${signal} received, but already shutting down...`);
      return;
    }

    setShuttingDown(true);
    logger.info(`${signal} received, starting graceful shutdown...`);

    // Run the passed handler plus any registered handlers
    const allHandlers = [onShutdown, ...getShutdownHandlers()];

    for (const handler of allHandlers) {
      try {
        await handler();
      } catch (error) {
        logger.error("Error during graceful shutdown", { error: (error as Error).message });
      }
    }

    logger.info("Graceful shutdown completed");
    process.exit(0);
  };

  // Handle different shutdown signals
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // For Windows
  process.on("SIGBREAK", () => shutdown("SIGBREAK"));

  // Return cleanup function
  return () => {
    process.off("SIGTERM", shutdown);
    process.off("SIGINT", shutdown);
    process.off("SIGBREAK", shutdown);
  };
}

// Re-export the Edge-safe health check so existing imports keep working
export { isHealthy } from './shutdown-state';