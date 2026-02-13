// Test: RSC fetch inside Suspense boundaries with cacheComponents enabled
// Usage: /?url=https://api.intellegam.com/customer/project/app/chat/config

import { Suspense } from "react";

async function fetchConfig(url: string, label: string) {
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
      label,
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
      label,
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

// Async server component rendered inside Suspense — like ChatConfig loading
async function ConfigBlock({ url, label }: { url: string; label: string }) {
  const result = await fetchConfig(url, label);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h3>
        {label}: {result.ok ? "OK" : "FAILED"}
      </h3>
      <p>
        Status: {result.status} | Body: {result.bodyLength} bytes | {result.ms}
        ms
      </p>
      {result.error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{result.error}</p>
      )}
      {result.parseError && (
        <p style={{ color: "red" }}>Parse error: {result.parseError}</p>
      )}
      <pre
        style={{
          background: "#f0f0f0",
          padding: "0.5rem",
          overflow: "auto",
          maxHeight: "200px",
          fontSize: "12px",
        }}
      >
        {JSON.stringify(result.parsed, null, 2) ?? "(empty)"}
      </pre>
    </div>
  );
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
        <p>cacheComponents: true</p>
        <h2>Tests</h2>
        <ul>
          <li>
            <a href="/api/test-fetch">/api/test-fetch</a> — hardcoded endpoints
            (API route)
          </li>
          <li>
            <a href="/api/test-fetch?url=https://jsonplaceholder.typicode.com/todos/1">
              /api/test-fetch?url=...
            </a>{" "}
            — dynamic URL (API route)
          </li>
          <li>
            <a href="/?url=https://jsonplaceholder.typicode.com/todos/1">
              /?url=...
            </a>{" "}
            — Suspense + cacheComponents (RSC)
          </li>
        </ul>
      </div>
    );
  }

  // Multiple Suspense boundaries fetching the same URL — mimics real app pattern
  // where page.tsx and multiple components each fetch configs
  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Suspense + cacheComponents Test</h1>
      <p>Runtime: {runtime}</p>
      <p>URL: {url}</p>
      <p>cacheComponents: true</p>
      <hr />

      <Suspense fallback={<p>Loading config 1...</p>}>
        <ConfigBlock url={url} label="Suspense 1" />
      </Suspense>

      <Suspense fallback={<p>Loading config 2...</p>}>
        <ConfigBlock url={url} label="Suspense 2" />
      </Suspense>

      <Suspense fallback={<p>Loading config 3...</p>}>
        <ConfigBlock url={url} label="Suspense 3" />
      </Suspense>

      <Suspense fallback={<p>Loading config 4...</p>}>
        <ConfigBlock url={url} label="Suspense 4" />
      </Suspense>
    </div>
  );
}
