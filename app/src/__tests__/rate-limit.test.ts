/**
 * Unit tests for the rate limiter — security-critical logic that was
 * previously untested. Uses fake timers to control the time window.
 *
 * Runs in the node environment because next/server needs the
 * Request/Response globals, which jsdom doesn't provide.
 *
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, withRateLimit } from '@/lib/rate-limit';

const makeRequest = (ip: string) =>
    new NextRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
    });

describe('rateLimit', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('allows requests under the limit and returns null', async () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 3 });

        const result = await limiter(makeRequest('1.1.1.1'));
        expect(result).toBeNull(); // null = continue to handler
    });

    it('blocks the request that exceeds the limit', async () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 2 });

        await limiter(makeRequest('2.2.2.2')); // 1
        await limiter(makeRequest('2.2.2.2')); // 2
        const blocked = await limiter(makeRequest('2.2.2.2')); // 3 → blocked

        expect(blocked).not.toBeNull();
        expect(blocked?.status).toBe(429);
        expect(blocked?.headers.get('Retry-After')).toBe('60');
        expect(blocked?.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('tracks clients independently by key', async () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 1 });

        await limiter(makeRequest('3.3.3.3')); // client A uses its quota
        const clientB = await limiter(makeRequest('4.4.4.4')); // client B unaffected

        expect(clientB).toBeNull();
    });

    it('resets the counter after the window passes', async () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 1 });

        await limiter(makeRequest('5.5.5.5'));
        const blocked = await limiter(makeRequest('5.5.5.5'));
        expect(blocked?.status).toBe(429);

        // Advance past the window
        jest.setSystemTime(new Date('2026-01-01T00:01:01Z'));

        const allowed = await limiter(makeRequest('5.5.5.5'));
        expect(allowed).toBeNull();
    });

    it('uses a custom keyGenerator when provided', async () => {
        const limiter = rateLimit({
            windowMs: 60000,
            maxRequests: 1,
            keyGenerator: (req) => `custom:${req.headers.get('x-forwarded-for')}`,
        });

        await limiter(makeRequest('6.6.6.6'));
        const blocked = await limiter(makeRequest('6.6.6.6'));

        expect(blocked?.status).toBe(429);
    });

    it('groups anonymous clients under one key', async () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 1 });

        // No x-forwarded-for header → both fall into "anonymous"
        const reqA = new NextRequest('http://localhost:3000/api/test');
        const reqB = new NextRequest('http://localhost:3000/api/test');

        await limiter(reqA);
        const blocked = await limiter(reqB);

        expect(blocked?.status).toBe(429);
    });
});

describe('withRateLimit', () => {
    it('calls the handler when the limit is not exceeded', async () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 5 });
        const handler = jest.fn().mockResolvedValue(new NextResponse('ok'));

        const wrapped = withRateLimit(handler, limiter);
        const response = await wrapped(makeRequest('7.7.7.7'));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(await response.text()).toBe('ok');
    });

    it('short-circuits with 429 without calling the handler', async () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 1 });
        const handler = jest.fn().mockResolvedValue(new NextResponse('ok'));

        const wrapped = withRateLimit(handler, limiter);
        await wrapped(makeRequest('8.8.8.8')); // uses the quota
        const blocked = await wrapped(makeRequest('8.8.8.8'));

        expect(handler).toHaveBeenCalledTimes(1); // not called the second time
        expect(blocked.status).toBe(429);
    });
});
