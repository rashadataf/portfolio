'use server';
import { meter } from "@/instrumentation.node";

const pageVisitCounter = meter.createCounter('page_visits_total', {
    description: 'Counts total visits to the page',
});

const blogViewCounter = meter.createCounter('blog_views_total', {
    description: 'Counts the number of views per blog post',
});

const timeSpentGauge = meter.createHistogram('time_spent_reading', {
    description: 'Time spent on a blog page (in seconds)',
});

export async function trackPageVisit(pageName: string) {
    pageVisitCounter.add(1, { page: pageName });
    return {
        message: `✅ Page Visit Tracked for: ${pageName}`,
    }
}

export async function trackBlogView(slug: string) {
    blogViewCounter.add(1, { articleSlug: slug });
}

export async function trackTimeSpent(slug: string, duration: number) {
    timeSpentGauge.record(duration, { articleSlug: slug });
}
