import { renderApplication } from "@angular/platform-server";
import { default as bootstrap } from "./main.server";

// Api imports
import type { IRequest } from "itty-router";
import { AutoRouter, error } from "itty-router";

// Declare the environment type
declare interface Env extends Record<string, any> {
  ASSETS: { fetch: (url: URL) => Promise<Response> };
  // ... declare more env variables here
}

async function render(url: URL, env: Env) {
  const indexUrl = new URL("/index.csr.html", url);
  const indexHtml = await env.ASSETS.fetch(indexUrl);
  const document = await indexHtml.text();

  const content = await renderApplication(bootstrap, {
    document,
    url: url.pathname + url.search,
  });

  return new Response(content, {
    status: 200,
    headers: {
      "content-type": "text/html",
      "cache-control": "public, max-age=0, s-maxage=0",
    },
  });
}

const router = AutoRouter<IRequest, [Env]>()
  .get("/api/hello", () => ({ message: "Hello, World!" }))
  .all("/api/*", () => error(404))
  .get("*", (request, env) => {
    const url = new URL(request.url);

    // If the URL has a file extension, we assume it's a static file
    if (url.pathname.includes(".")) {
      return env.ASSETS.fetch(url);
    } else {
      return render(url, env);
    }
  })
  .all("*", () => error(404));

export const fetch = (request: Request, env: Env) => {
  return router.fetch(request, env).catch((err: Error) => {
    console.error("[SSR Error]", err);
    return new Response("Internal Server Error", { status: 500 });
  });
};

// Export for Cloudflare Pages
export default { fetch };
