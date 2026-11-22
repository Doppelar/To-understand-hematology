// Builds the app into Vercel's Build Output API layout (.vercel/output):
//   - static/            the Vite client
//   - functions/api.func the Express API bundled as one Node function
import { build as esbuild } from "esbuild";
import { execFileSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, ".vercel/output");

await rm(out, { recursive: true, force: true });

execFileSync(process.execPath, [path.join(root, "node_modules/vite/bin/vite.js"), "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});
await cp(path.join(root, "dist/public"), path.join(out, "static"), { recursive: true });

const funcDir = path.join(out, "functions/api.func");
await mkdir(funcDir, { recursive: true });
await esbuild({
  entryPoints: [path.join(root, "server/vercel-handler.ts")],
  outfile: path.join(funcDir, "index.cjs"),
  platform: "node",
  target: "node22",
  format: "cjs",
  bundle: true,
  external: ["bufferutil", "utf-8-validate", "pg-native"],
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});
await writeFile(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs22.x",
    handler: "index.cjs",
    launcherType: "Nodejs",
    shouldAddHelpers: false,
    maxDuration: 60,
    regions: ["sin1"],
  }),
);

await writeFile(
  path.join(out, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "^/api/(.*)$", dest: "/api" },
      { src: "^/(.*)$", dest: "/index.html" },
    ],
  }),
);
console.log("Vercel output written to", out);
