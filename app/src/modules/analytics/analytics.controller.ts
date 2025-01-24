'use server';
import { AnalyticsService } from "@/modules/analytics/analytics.service";
import { TelemetryService } from "@/modules/analytics/telemetry.service";

const telemetryService = TelemetryService.getInstance();
const analyticsService = new AnalyticsService(telemetryService);

export async function trackPageVisit(pageName: string) {
    return await analyticsService.trackPageVisit(pageName);
}

export async function trackBlogView(slug: string) {
    return await analyticsService.trackBlogView(slug);
}

export async function trackTimeSpent(slug: string, duration: number) {
    return await analyticsService.trackTimeSpent(slug, duration);
}

export async function markInteraction() {
    return await analyticsService.markInteraction();
}

export async function checkBounceRate(pageName: string) {
    return await analyticsService.checkBounceRate(pageName);
}

export async function trackClickEvent(eventName: string, elementId: string) {
    return await analyticsService.trackClickEvent(eventName, elementId);
}

export async function reportScrollDepth(maxScrollDepth: number, slug: string) {
    return await analyticsService.reportScrollDepth(maxScrollDepth, slug);
}

export async function trackSearchQuery(query: string) {
    return await analyticsService.trackSearchQuery(query);
}

export async function startSessionTimer() {
    return await analyticsService.startSessionTimer();
}

export async function endSessionTimer(pageName: string) {
    return await analyticsService.endSessionTimer(pageName);
}
