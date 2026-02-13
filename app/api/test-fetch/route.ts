// Minimal repro: Bun runtime fetch() returns empty body for valid HTTPS responses
// Test public endpoints that return standard JSON with Content-Length headers

const TEST_ENDPOINTS = [
  {
    name: "JSONPlaceholder - single todo (83 bytes)",
    url: "https://jsonplaceholder.typicode.com/todos/1",
  },
  {
    name: "JSONPlaceholder - 200 todos (~24KB)",
    url: "https://jsonplaceholder.typicode.com/todos",
  },
  {
    name: "httpbin - JSON response",
    url: "https://httpbin.org/json",
  },
  {
    name: "GitHub API - public meta",
    url: "https://api.github.com/meta",
  },
];

export async function GET() {
  const results = [];

  for (const endpoint of TEST_ENDPOINTS) {
    const result = {
      name: endpoint.name,
      url: endpoint.url,
      status: 0,
      bodyLength: 0,
      bodyPreview: "",
      error: null as string | null,
      contentLength: null as string | null,
    };

    try {
      const response = await fetch(endpoint.url, {
        headers: { Accept: "application/json" },
      });

      result.status = response.status;
      result.contentLength = response.headers.get("content-length");

      const body = await response.text();
      result.bodyLength = body.length;
      result.bodyPreview = body.slice(0, 200);

      if (body.length === 0 && response.ok) {
        result.error = "EMPTY_BODY: fetch() returned 200 but body is empty";
      }

      try {
        JSON.parse(body);
      } catch (parseError) {
        result.error = `JSON_PARSE_FAILED: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
      }
    } catch (fetchError) {
      result.error = `FETCH_FAILED: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`;
    }

    results.push(result);
  }

  // Run each target endpoint 10 times to show intermittent behavior
  async function repeatedFetch(url: string, runs: number) {
    const multiRunResults = [];
    for (let i = 0; i < runs; i++) {
      try {
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const body = await response.text();
        multiRunResults.push({
          run: i + 1,
          status: response.status,
          bodyLength: body.length,
          ok: body.length > 0,
        });
      } catch (error) {
        multiRunResults.push({
          run: i + 1,
          status: 0,
          bodyLength: 0,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return {
      url,
      runs: multiRunResults,
      successRate: `${multiRunResults.filter((r) => r.ok).length}/${runs}`,
    };
  }

  const jsonPlaceholderRepeated = await repeatedFetch(
    "https://jsonplaceholder.typicode.com/todos/1",
    10
  );

  return Response.json({
    runtime: typeof Bun !== "undefined" ? `Bun ${Bun.version}` : "Node.js",
    timestamp: new Date().toISOString(),
    singleFetch: results,
    repeatedFetch: {
      jsonPlaceholder: jsonPlaceholderRepeated,
    },
  });
}
