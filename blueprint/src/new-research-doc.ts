import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import { blueprintDir, researchDir, validateSlug } from "./paths.js";

const templatePath = path.join(blueprintDir, "market-research", "TEMPLATE.md");

// Usage: pnpm blueprint:research [slug] ["one-line title"] - args skip the prompts.
async function main() {
  p.intro("New market-research doc");

  const [argSlug, argTitle] = process.argv.slice(2);

  const slug =
    argSlug ??
    (await p.text({
      message: "Idea slug (kebab-case)",
      placeholder: "habit-tracker",
      validate: validateSlug,
    }));
  if (p.isCancel(slug)) return p.cancel("Cancelled.");

  const slugError = validateSlug(slug);
  if (slugError) return p.cancel(slugError);

  const title =
    argTitle ??
    (await p.text({
      message: "Idea in one line",
      placeholder: "A dead-simple daily habit tracker with no account required",
      validate: (v) => (v ? undefined : "Required"),
    }));
  if (p.isCancel(title)) return p.cancel("Cancelled.");

  const target = path.join(researchDir, `${slug}.md`);
  if (fs.existsSync(target)) {
    return p.cancel(`${path.relative(process.cwd(), target)} already exists.`);
  }

  const body = fs
    .readFileSync(templatePath, "utf8")
    .replace("{{TITLE}}", title)
    .replace("{{SLUG}}", slug);

  fs.mkdirSync(researchDir, { recursive: true });
  fs.writeFileSync(target, body, "utf8");

  p.outro(
    `Created ${path.relative(process.cwd(), target)}\nFill it in, then run: pnpm blueprint:new`,
  );
}

main();
