/**
 * Shared helpers for controller/service/repository unit tests.
 *
 * These tests never touch a real Postgres connection — the db service is
 * mocked per test file via:
 *   jest.mock('@/modules/db/db.service', () => ({ dbService: { query: jest.fn() } }))
 */

/** Build a pg-shaped query result. */
export function pgResult<T>(rows: T[], rowCount = rows.length) {
    return { rows, rowCount, command: '', oid: 0, fields: [] };
}

/** A minimal admin session shape for mocking `@/lib/auth`. */
export const adminSession = {
    user: { id: '1', email: 'admin@example.com', role: 'admin' as const },
    expires: new Date(Date.now() + 86400000).toISOString(),
};
