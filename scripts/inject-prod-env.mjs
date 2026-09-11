#!/usr/bin/env node
/**
 * Deploy overlay: inline .prod-env.json into vercel-auth-env.ts so serverless
 * runtimes see DATABASE_URL / auth / xAI keys even when Vercel project env is empty.
 * The JSON file is uploaded at deploy time and is gitignored.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const envPath = ".prod-env.json";
const target = "src/lib/vercel-auth-env.ts";
if (!existsSync(envPath) || !existsSync(target)) {
  console.log("[inject-prod-env] skip — overlay or target missing");
  process.exit(0);
}

const extra = JSON.parse(readFileSync(envPath, "utf8"));
if (!extra || typeof extra !== "object") {
  console.log("[inject-prod-env] skip — invalid overlay");
  process.exit(0);
}

const lines = Object.entries(extra)
  .filter(([, value]) => typeof value === "string" && value)
  .map(
    ([key, value]) =>
      `process.env[${JSON.stringify(key)}] = process.env[${JSON.stringify(key)}] || ${JSON.stringify(value)};`,
  );
if (lines.length === 0) process.exit(0);

const src = readFileSync(target, "utf8");
writeFileSync(target, `${lines.join("\n")}\n${src}`);
console.log("[inject-prod-env] applied", Object.keys(extra).join(", "));
