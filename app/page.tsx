// Server Component that fetches during RSC render — like the real app does
// Usage: /?url=https://api.intellegam.com/customer/project/app/chat/config

async function fetchConfig(url: string) {
  const start = performance.now();
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const body = await response.text();
    const ms = Math.round(performance.now() - start);

    let parsed = null;
    let parseError = null;
    try {
      parsed = JSON.parse(body);
    } catch (error) {
      parseError = error instanceof Error ? error.message : String(error);
    }

    return {
      status: response.status,
      bodyLength: body.length,
      ok: body.length > 0,
      ms,
      parsed,
      parseError,
      error:
        body.length === 0 && response.ok
          ? "EMPTY_BODY: status 200 but body is empty"
          : null,
    };
  } catch (error) {
    return {
      status: 0,
      bodyLength: 0,
      ok: false,
      ms: Math.round(performance.now() - start),
      parsed: null,
      parseError: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const url = typeof params.url === "string" ? params.url : null;
  const runtime =
    typeof Bun !== "undefined" ? `Bun ${Bun.version}` : "Node.js";

  if (!url) {
    return (
      <div style={{ fontFamily: "monospace", padding: "2rem" }}>
        <h1>Bun fetch() Repro</h1>
        <p>Runtime: {runtime}</p>
        <h2>Tests</h2>
        <ul>
          <li>
            <a href="/api/test-fetch">/api/test-fetch</a> — hardcoded public
            endpoints (API route)
          </li>
          <li>
            <a href="/api/test-fetch?url=https://jsonplaceholder.typicode.com/todos/1">
              /api/test-fetch?url=...
            </a>{" "}
            — dynamic URL test (API route)
          </li>
          <li>
            <a href="/?url=https://jsonplaceholder.typicode.com/todos/1">
              /?url=...
            </a>{" "}
            — fetch during RSC render (this page)
          </li>
        </ul>
      </div>
    );
  }

  // Fetch during RSC render — this is the cold start context
  const result = await fetchConfig(url);

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>RSC Fetch Test</h1>
      <p>Runtime: {runtime}</p>
      <p>URL: {url}</p>
      <p>
        Status: {result.status} | Body: {result.bodyLength} bytes |{" "}
        {result.ms}ms
      </p>
      {result.error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ERROR: {result.error}
        </p>
      )}
      {result.parseError && (
        <p style={{ color: "red" }}>Parse error: {result.parseError}</p>
      )}
      <h2>Response</h2>
      <pre style={{ background: "#f0f0f0", padding: "1rem", overflow: "auto" }}>
        {JSON.stringify(result.parsed, null, 2) ?? "(empty)"}
      </pre>
    </div>
  );
}
