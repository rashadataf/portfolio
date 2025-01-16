import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "default-service";

// Ensure metrics are only initialized once
const OTLP_ENDPOINT = process.env.OTEL_COLLECTOR_ENDPOINT;
const EXPORT_INTERVAL = parseInt(process.env.OTEL_COLLECTOR_EXPORT_INTERVAL || "5000", 10);

const metricExporter = new OTLPMetricExporter({ url: OTLP_ENDPOINT });
const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: EXPORT_INTERVAL,
});

const meterProvider = new MeterProvider({
    readers: [metricReader],
});

export const meter = meterProvider.getMeter(OTEL_SERVICE_NAME);

const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: OTEL_SERVICE_NAME,
    }),
    spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
})

sdk.start()