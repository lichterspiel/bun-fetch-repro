import { init } from "@sentry/nextjs";

// Dummy DSN — Sentry SDK still patches fetch even if events fail to send
init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  environment: "production",
  enabled: true,
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
});
