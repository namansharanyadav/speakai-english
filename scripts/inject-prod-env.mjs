#!/usr/bin/env node
/**
 * Deploy overlay: write .prod-env.json into src/lib/prod-secrets.ts so the
 * serverless bundle inlines DATABASE_URL / auth / xAI keys. JSON is uploaded
 * at deploy time and gitignored.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const envPath = ".prod-env.json";
const target = "src/lib/prod-secrets.ts";
if (!existsSync(envPath)) {
  console.log("[inject-prod-env] skip — overlay missing");
  process.exit(0);
}

const extra = JSON.parse(readFileSync(envPath, "utf8"));
if (!extra || typeof extra !== "object") {
  console.log("[inject-prod-env] skip — invalid overlay");
  process.exit(0);
}

const secrets = {};
for (const [key, value] of Object.entries(extra)) {
  if (typeof value === "string" && value) secrets[key] = value;
}

writeFileSync(
  target,
  `/** Generated at deploy. Do not commit. */\nexport const PROD_SECRETS: Record<string, string> = ${JSON.stringify(secrets, null, 2)};\n`,
);
console.log("[inject-prod-env] applied", Object.keys(secrets).join(", "));
