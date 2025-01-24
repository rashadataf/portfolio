import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

export class TelemetryService {
    private static instance: TelemetryService; // Static instance for the singleton
    private meterProvider;
    private sdk;

    private constructor() {
        // Private constructor to restrict instantiation
        const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "default-service";
        const OTLP_ENDPOINT = process.env.OTEL_COLLECTOR_ENDPOINT;
        const EXPORT_INTERVAL = parseInt(process.env.OTEL_COLLECTOR_EXPORT_INTERVAL || "5000", 10);

        const metricExporter = new OTLPMetricExporter({ url: OTLP_ENDPOINT });
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
            spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
        });

        this.sdk.start();
    }

    public static getInstance(): TelemetryService {
        // Ensure a single instance is created
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }

    createCounter(name: string, options: { description: string }) {
        return this.meterProvider.getMeter(process.env.OTEL_SERVICE_NAME || "default-service").createCounter(name, options);
    }

    createHistogram(name: string, options: { description: string }) {
        return this.meterProvider.getMeter(process.env.OTEL_SERVICE_NAME || "default-service").createHistogram(name, options);
    }
}
