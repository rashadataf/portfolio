// import { meter } from "@/instrumentation.node";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
// import { delay } from "./utils";
import { TelemetryService } from "@/modules/analytics/telemetry.service";

export class AnalyticsService {
    private pageVisitCounter;
    private blogViewCounter;
    private timeSpentGauge;
    private bounceRateCounter;
    private clickEventCounter;
    private scrollDepthGauge;
    private searchQueryCounter;

    constructor(private telemetryService: TelemetryService) {
        this.pageVisitCounter = this.telemetryService.createCounter('page_visits_total', {
            description: 'Counts total visits to the page',
        });

        this.blogViewCounter = this.telemetryService.createCounter('blog_views_total', {
            description: 'Counts the number of views per blog post',
        });

        this.timeSpentGauge = this.telemetryService.createHistogram('time_spent_reading', {
            description: 'Time spent on a blog page (in seconds)',
        });

        this.bounceRateCounter = this.telemetryService.createCounter('bounce_rate_total', {
            description: 'Counts the total number of bounces for a page',
        });

        this.clickEventCounter = this.telemetryService.createCounter('click_events_total', {
            description: 'Counts the number of clicks on specific elements',
        });

        this.scrollDepthGauge = this.telemetryService.createHistogram('scroll_depth_percentage', {
            description: 'Records the percentage of scroll depth for a blog page',
        });

        this.searchQueryCounter = this.telemetryService.createCounter('search_queries_total', {
            description: 'Counts the number of searches performed',
        });
    }

    private async setCookies(key: string, value: string, options?: Partial<ResponseCookie>) {
        const cookieStore = await cookies();
        cookieStore.set(key, value, { ...options });
    }

    private async getCookies(key: string) {
        const cookieStore = await cookies();
        return cookieStore.get(key)?.value;
    }

    private async deleteCookies(key: string) {
        const cookieStore = await cookies();
        cookieStore.delete(key);
    }

    private async getVisitorId() {
        let visitorId = await this.getCookies('visitorId');

        if (!visitorId) {
            visitorId = uuidv4();
            await this.setCookies('visitorId', visitorId, { path: '/', maxAge: 31536000 });
        }

        return visitorId;
    }

    async trackPageVisit(pageName: string) {
        const visitorId = await this.getVisitorId();
        this.pageVisitCounter.add(1, { page: pageName, visitorId });
    }

    async trackBlogView(slug: string) {
        const visitorId = await this.getVisitorId();
        this.blogViewCounter.add(1, { articleSlug: slug, visitorId });
    }

    async trackTimeSpent(slug: string, duration: number) {
        const visitorId = await this.getVisitorId();
        this.timeSpentGauge.record(duration, { articleSlug: slug, visitorId });
    }

    async markInteraction() {
        await this.setCookies('hasInteracted', 'true', { maxAge: 31536000 });
    }

    async checkBounceRate(pageName: string) {
        // await delay(5000);
        const visitorId = await this.getVisitorId();
        const hasInteracted = await this.getCookies('hasInteracted');
        if (!hasInteracted) {
            this.bounceRateCounter.add(1, { page: pageName, visitorId });
        }
    }

    async trackClickEvent(eventName: string, elementId: string) {
        const visitorId = await this.getVisitorId();
        this.clickEventCounter.add(1, { eventName, elementId, visitorId });
    }

    async reportScrollDepth(maxScrollDepth: number, slug: string) {
        const visitorId = await this.getVisitorId();
        this.scrollDepthGauge.record(maxScrollDepth * 100, { articleSlug: slug, visitorId });
    }

    async trackSearchQuery(query: string) {
        const visitorId = await this.getVisitorId();
        this.searchQueryCounter.add(1, { searchTerm: query, visitorId });
    }

    async startSessionTimer() {
        const sessionStartTime = Date.now();
        await this.setCookies('sessionStartTime', sessionStartTime.toString(), { maxAge: 31536000 });
    }

    async endSessionTimer(pageName: string) {
        const sessionStartTime = await this.getCookies('sessionStartTime');
        if (!sessionStartTime) {
            console.warn('Session start time not found.');
            return;
        }

        const duration = (Date.now() - Number(sessionStartTime)) / 1000;
        const visitorId = await this.getVisitorId();
        this.timeSpentGauge.record(duration, { page: pageName, visitorId });
        await this.deleteCookies('sessionStartTime');
    }
}