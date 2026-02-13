// Minimal repro: @vercel/otel + Bun runtime = fetch() returns empty bodies
// Usage: /?url=https://api.intellegam.com/customer/project/app/chat/config

async function FetchResult({ url }: { url: string }) {
  const start = performance.now();
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const body = await response.text();
  const ms = Math.round(performance.now() - start);

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <p>
        Status: {response.status} | Body: {body.length} bytes | {ms}ms
      </p>
      {body.length === 0 && response.ok && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          BUG: fetch() returned 200 but body is empty
        </p>
      )}
      <pre style={{ background: "#f0f0f0", padding: "0.5rem", overflow: "auto", maxHeight: "200px", fontSize: "12px" }}>
        {body.slice(0, 500) || "(empty)"}
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
  const runtime = typeof Bun !== "undefined" ? `Bun ${Bun.version}` : "Node.js";

  if (!url) {
    return (
      <div style={{ fontFamily: "monospace", padding: "2rem" }}>
        <h1>Bun + @vercel/otel fetch() Repro</h1>
        <p>Runtime: {runtime}</p>
        <p>Add ?url=... to test</p>
        <ul>
          <li><a href="/?url=https://jsonplaceholder.typicode.com/todos/1">JSONPlaceholder</a></li>
          <li><a href="/api/test-fetch">API route test (10x repeated)</a></li>
          <li><a href="/api/test-fetch?url=https://jsonplaceholder.typicode.com/todos/1">API route dynamic</a></li>
        </ul>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Bun + @vercel/otel fetch() Repro</h1>
      <p>Runtime: {runtime}</p>
      <p>URL: {url}</p>
      <FetchResult url={url} />
    </div>
  );
}
