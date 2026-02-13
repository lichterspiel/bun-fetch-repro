// TESTING: Only Sentry, no OTel
export async function register() {
  // OTel disabled for this test
  // registerOTel({ serviceName: "bun-fetch-repro" });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}
