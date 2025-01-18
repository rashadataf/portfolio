'use server';
import { meter } from "@/instrumentation.node";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers'
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { delay } from "./utils";

async function setCookies(key: string, value: string, options?: Partial<ResponseCookie>) {
    const cookieStore = await cookies()
    cookieStore.set(key, value, { ...options });
}

async function getCookies(key: string) {
    const cookieStore = await cookies();
    const value = cookieStore.get(key)?.value;
    return value;
}

async function deleteCookies(key: string) {
    const cookieStore = await cookies();
    cookieStore.delete(key);
}

async function getVisitorId() {
    let visitorId = await getCookies('visitorId');

    if (!visitorId) {
        visitorId = uuidv4();
        await setCookies('visitorId', visitorId, { path: '/', maxAge: 31536000 })
    }

    return visitorId;
}

const pageVisitCounter = meter.createCounter('page_visits_total', {
    description: 'Counts total visits to the page',
});

const blogViewCounter = meter.createCounter('blog_views_total', {
    description: 'Counts the number of views per blog post',
});

const timeSpentGauge = meter.createHistogram('time_spent_reading', {
    description: 'Time spent on a blog page (in seconds)',
});

const bounceRateCounter = meter.createCounter('bounce_rate_total', {
    description: 'Counts the total number of bounces for a page',
});

const clickEventCounter = meter.createCounter('click_events_total', {
    description: 'Counts the number of clicks on specific elements',
});

const scrollDepthGauge = meter.createHistogram('scroll_depth_percentage', {
    description: 'Records the percentage of scroll depth for a blog page',
});

const searchQueryCounter = meter.createCounter('search_queries_total', {
    description: 'Counts the number of searches performed',
});

export async function trackPageVisit(pageName: string) {
    const visitorId = await getVisitorId();
    pageVisitCounter.add(1, { page: pageName, visitorId });
}

export async function trackBlogView(slug: string) {
    const visitorId = await getVisitorId();
    blogViewCounter.add(1, { articleSlug: slug, visitorId });
}


export async function trackTimeSpent(slug: string, duration: number) {
    const visitorId = await getVisitorId();
    timeSpentGauge.record(duration, { articleSlug: slug, visitorId });
}

export async function markInteraction() {
    await setCookies('hasInteracted', 'true', { maxAge: 31536000 });
}

export async function checkBounceRate(pageName: string) {
    await delay(5000);
    const visitorId = await getVisitorId();
    const hasInteracted = await getCookies('hasInteracted');
    if (!hasInteracted) {
        bounceRateCounter.add(1, { page: pageName, visitorId });
    }
}

export async function trackClickEvent(eventName: string, elementId: string) {
    const visitorId = await getVisitorId();
    clickEventCounter.add(1, { eventName, elementId, visitorId });
}

export async function reportScrollDepth(maxScrollDepth: number, slug: string) {
    const visitorId = await getVisitorId();
    scrollDepthGauge.record(maxScrollDepth * 100, { articleSlug: slug, visitorId });
}

export async function trackSearchQuery(query: string) {
    const visitorId = await getVisitorId();
    searchQueryCounter.add(1, { searchTerm: query, visitorId });
}

export async function startSessionTimer() {
    const sessionStartTime = Date.now();
    await setCookies('sessionStartTime', sessionStartTime.toString(), { maxAge: 31536000 });
}

export async function endSessionTimer(pageName: string) {
    const sessionStartTime = await getCookies('sessionStartTime');
    if (!sessionStartTime) {
        console.warn('Session start time not found.');
        return;
    }

    const duration = (Date.now() - Number(sessionStartTime)) / 1000;
    const visitorId = await getVisitorId();
    timeSpentGauge.record(duration, { page: pageName, visitorId });
    await deleteCookies('sessionStartTime');
}
