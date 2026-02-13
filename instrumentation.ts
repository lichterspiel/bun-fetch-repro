// MINIMAL REPRO: Only @vercel/otel causes Bun fetch() to return empty bodies
import { registerOTel } from "@vercel/otel";

export async function register() {
  registerOTel({ serviceName: "bun-fetch-repro" });
}
