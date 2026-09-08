import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import { dirname, join, resolve as resolvePath } from "node:path";

/**
 * Teaches `node --test` how TypeScript resolves imports.
 *
 * Node strips types on its own now, so the email templates run under the test
 * runner with no build step. What it does not know is the "@/" alias from
 * tsconfig, or that "./layout" means "./layout.ts". Both are handled here,
 * which is what lets the templates be tested as plain functions instead of
 * through a rendered page.
 */
const SRC = resolvePath(dirname(fileURLToPath(import.meta.url)), "../src");
const EXTENSIONS = [".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

function firstThatExists(basePath) {
  if (existsSync(basePath) && !basePath.endsWith("/")) return basePath;
  for (const ext of EXTENSIONS) {
    if (existsSync(basePath + ext)) return basePath + ext;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const hit = firstThatExists(join(SRC, specifier.slice(2)));
    if (hit) return next(pathToFileURL(hit).href, context);
  }

  // Extensionless relative imports, which TypeScript allows and Node does not.
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const target = fileURLToPath(new URL(specifier, context.parentURL));
    const hit = firstThatExists(target);
    if (hit) return next(pathToFileURL(hit).href, context);
  }

  return next(specifier, context);
}
