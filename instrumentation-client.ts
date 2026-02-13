import { init, replayIntegration } from "@sentry/nextjs";

init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  environment: "production",
  enabled: true,
  tracesSampleRate: 1,
  integrations: [replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
});
