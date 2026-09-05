// Edge-safe shutdown state and handler registry.
//
// This module MUST stay Edge-safe (no Node-only APIs like process.on/off):
// it is statically imported by db.service.ts, which is (indirectly) bundled
// into Edge Middleware via the auth -> user.controller -> db.service chain.
//
// The actual signal handling lives in graceful-shutdown.ts (Node-only),
// which is dynamically imported from instrumentation.ts.

let isShuttingDown = false;

type ShutdownHandler = () => Promise<void> | void;

const handlers: ShutdownHandler[] = [];

/** Register a cleanup handler to run during graceful shutdown. */
export function registerShutdownHandler(
  handler: ShutdownHandler
): () => void {
  handlers.push(handler);

  // Return an unregister function
  return () => {
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  };
}

/** Get all registered shutdown handlers (used by the Node-only signal setup). */
export function getShutdownHandlers(): readonly ShutdownHandler[] {
  return handlers;
}

/** Mark the process as shutting down (used by the Node-only signal setup). */
export function setShuttingDown(value: boolean): void {
  isShuttingDown = value;
}

/** Health check: false once shutdown has started. */
export function isHealthy(): boolean {
  return !isShuttingDown;
}
