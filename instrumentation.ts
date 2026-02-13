// DISABLED for testing — only OTel, no Sentry
import { registerOTel } from "@vercel/otel";

export async function register() {
  registerOTel({ serviceName: "bun-fetch-repro" });
  // Sentry disabled for this test
  // await import("./sentry.server.config");
}
