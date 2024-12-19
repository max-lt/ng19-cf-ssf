/// <reference types="@types/bun" />

// @ts-ignore - This is a workaround for the missing types
import { fetch as handleRequest } from "./dist/server/server.mjs";

console.log("[Bun] Starting server on port 4200");

const env = {
  ...process.env,
  ASSETS: {
    async fetch({ pathname }: URL) {
      const browserDir = import.meta.dir + "/dist/browser";
      const file = Bun.file(browserDir + pathname);

      if (file) {
        try {
          const headers = { "content-type": file.type };
          return new Response(await file.text(), { headers });
        } catch (err) {
          return new Response("Internal Server Error", { status: 500 });
        }
      } else {
        return new Response("Not Found", { status: 404 });
      }
    },
  },
};

Bun.serve({
  port: 4200,
  fetch(req) {
    console.log("[Bun] Request", req.url);

    return handleRequest(req, env);
  },
});
