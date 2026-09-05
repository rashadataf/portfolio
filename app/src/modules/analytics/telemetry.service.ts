import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { logger } from '@/lib/logger';

export class TelemetryService {
    private static instance: TelemetryService; // Static instance for the singleton
    private meterProvider;
    private sdk;

    private constructor() {
        // Private constructor to restrict instantiation
        const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "portfolio-app";
        const OTLP_ENDPOINT = process.env.OTEL_COLLECTOR_ENDPOINT || "http://localhost:4318/v1/traces";
        const EXPORT_INTERVAL = parseInt(process.env.OTEL_COLLECTOR_EXPORT_INTERVAL || "5000", 10);

        const metricExporter = new OTLPMetricExporter({ url: OTLP_ENDPOINT.replace('/v1/traces', '/v1/metrics') });
        const metricReader = new PeriodicExportingMetricReader({
            exporter: metricExporter,
            exportIntervalMillis: EXPORT_INTERVAL,
        });

        this.meterProvider = new MeterProvider({
            readers: [metricReader],
        });

        this.sdk = new NodeSDK({
            resource: new Resource({
                [ATTR_SERVICE_NAME]: OTEL_SERVICE_NAME,
            }),
            spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter({ url: OTLP_ENDPOINT })),
        });

        this.sdk.start();
        logger.info('OpenTelemetry SDK started', { serviceName: OTEL_SERVICE_NAME });
    }

    public static getInstance(): TelemetryService {
        // Ensure a single instance is created
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }

    createCounter(name: string, options: { description: string }) {
        return this.meterProvider.getMeter(process.env.OTEL_SERVICE_NAME || "portfolio-app").createCounter(name, options);
    }

    createHistogram(name: string, options: { description: string }) {
        return this.meterProvider.getMeter(process.env.OTEL_SERVICE_NAME || "portfolio-app").createHistogram(name, options);
    }

    async shutdown(): Promise<void> {
        try {
            await this.sdk.shutdown();
            logger.info('OpenTelemetry SDK shut down gracefully');
        } catch (error) {
            logger.error('Error shutting down OpenTelemetry SDK', { error: (error as Error).message });
            throw error;
        }
    }
}
