import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.url("Invalid DATABASE_URL"),

  // Auth
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_BASE_PATH: z.string().optional(),
  AUTH_TRUST_HOST: z.string().default("true"),

  // Domain
  DOMAIN_NAME: z.string().default("localhost"),
  PROTOCOL: z.enum(["http", "https"]).default("https"),

  // External URLs
  NEXT_PUBLIC_SITE_URL: z.url().optional(),

  // Email (for alerts)
  ALERTMANAGER_EMAIL_TO: z.email().optional(),
  ALERTMANAGER_EMAIL_FROM: z.email().optional(),
  ALERTMANAGER_SMTP_HOST: z.string().optional(),
  ALERTMANAGER_SMTP_PORT: z.string().optional(),
  ALERTMANAGER_SMTP_USERNAME: z.string().optional(),
  ALERTMANAGER_SMTP_PASSWORD: z.string().optional(),

  // Admin credentials
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  // Grafana
  GRAFANA_ADMIN_USER: z.string().optional(),
  GRAFANA_ADMIN_PASSWORD: z.string().optional(),

  // Loki
  LOKI_AUTH_USERNAME: z.string().optional(),
  LOKI_AUTH_PASSWORD: z.string().optional(),

  // Environment
  ENV_TYPE: z.enum(["development", "staging", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);

// Type-safe access to environment variables
export type Env = z.infer<typeof envSchema>;

// Helper to get typed env variable
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  return env[key];
}