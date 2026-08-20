import { fileURLToPath } from "node:url";
import path from "node:path";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const appsDir = path.join(repoRoot, "apps");
export const researchDir = path.join(repoRoot, "docs", "research");
export const blueprintDir = path.join(repoRoot, "blueprint");

export const SLUG_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export function validateSlug(value: string): string | undefined {
  if (!value) return "Required";
  if (!SLUG_PATTERN.test(value)) return "Use lowercase kebab-case, e.g. habit-tracker";
}
