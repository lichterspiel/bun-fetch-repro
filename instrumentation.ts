// Matches real app: Sentry + OpenTelemetry instrumentation
import { captureRequestError } from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";

export async function register() {
  registerOTel({ serviceName: "bun-fetch-repro" });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

export const onRequestError = captureRequestError;
