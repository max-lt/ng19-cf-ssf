# Ng19CfSsr

This project intends to demonstrate how to do an [Angular 9 application with server-side rendering (SSR) to Cloudflare Workers][1].

## Step by step reproduction

### Create a new Angular project with the following options:

```
ng new my-app \
  --minimal \
  --strict \
  --routing \
  --style=css \
  --ssr \
  --server-routing=false \
  --experimental-zoneless
```

### Install Cloudflare Workers CLI

- wrangler is the Cloudflare Workers CLI, it will allow us to run our worker locally
- itty-router is a lightweight router for Workers

```bash
npm i --save-dev wrangler itty-router
```

### Create a new Cloudflare Worker

See [src/worker.ts](src/worker.ts) for the code.

### Edit angular.json configuration

See [angular.json](angular.json) for the configuration.

```diff
...
"build": {
  "builder": "@angular-devkit/build-angular:application",
  "options": {
-   "outputPath": "dist/my-app",
+   "outputPath": "dist",
    "server": "src/main.server.ts",
-   "prerender": true, /* For some reason, prerender doesn't works with MacOs */
+   "prerender": false,
    "ssr": {
      "entry": "src/server.ts"
    },
  },
  "configurations": {
+    "worker": {
+      "tsConfig": "tsconfig.worker.json",
+      "ssr": {
+        "entry": "src/worker.ts",
+        "experimentalPlatform": "neutral"
+      }
+    },
    "production": {
  ...
```

### Add `tsconfig.worker.ts`

Copy `tsconfig.app.json` to `tsconfig.worker.json` and edit it:

```diff
...
  "files": [
    "src/main.ts",
    "src/main.server.ts",
-   "src/server.ts"
+   "src/worker.ts"
  ],
...
```

### Build the worker

```bash
ng build --configuration worker
```

### Bundle the worker

```bash
npx esbuild --bundle dist/server/server.mjs \
  --outfile=dist/browser/_worker.js \
  --platform=browser \
  --target=es2022 \
  --format=esm
```

### Run the worker locally

```bash
npx wrangler pages dev dist/browser --port 4200 --compatibility-date=2024-12-05
```

## Create a Bun adapter

### Install Bun types

```bash
npm i --save-dev @types/bun
```

### Create the Bun adapter

See [bun.ts](bun.ts) for the code.

### Run the worker locally with Bun

```bash
bun run bun.ts
```

[1]: https://www.lechat.dev/blog/2024/angular-ssr-with-cloudflare-pages-and-bun
