// Dynamic fetch test: GET /api/test-fetch/https://example.com/path
// Fetches the given URL 10 times and reports success/failure rates

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ url: string[] }> }
) {
  const { url: urlSegments } = await params;
  const targetUrl = urlSegments.join("/");

  // Basic URL validation
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    return Response.json(
      { error: "URL must start with http:// or https://" },
      { status: 400 }
    );
  }

  const runs = [];

  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    try {
      const response = await fetch(targetUrl, {
        headers: { Accept: "application/json" },
      });
      const body = await response.text();
      const elapsed = Math.round(performance.now() - start);

      runs.push({
        run: i + 1,
        status: response.status,
        bodyLength: body.length,
        ok: body.length > 0,
        ms: elapsed,
        ...(body.length === 0 && response.ok
          ? { error: "EMPTY_BODY: status 200 but body is empty" }
          : {}),
        ...(i === 0 ? { bodyPreview: body.slice(0, 200) } : {}),
      });
    } catch (error) {
      const elapsed = Math.round(performance.now() - start);
      runs.push({
        run: i + 1,
        status: 0,
        bodyLength: 0,
        ok: false,
        ms: elapsed,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const successes = runs.filter((r) => r.ok).length;

  return Response.json({
    runtime: typeof Bun !== "undefined" ? `Bun ${Bun.version}` : "Node.js",
    timestamp: new Date().toISOString(),
    url: targetUrl,
    successRate: `${successes}/10`,
    runs,
  });
}
