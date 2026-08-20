import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import * as p from "@clack/prompts";
import { appsDir, researchDir, validateSlug } from "./paths.js";

type Flavor = "offline" | "backend";

function readJson(file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function scaffoldExpoApp(slug: string) {
  execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["--yes", "create-expo-app@latest", slug, "--template", "blank-typescript", "--no-install"],
    { cwd: appsDir, stdio: "inherit" },
  );
}

function wireWorkspace(appDir: string, slug: string, flavor: Flavor) {
  const pkgPath = path.join(appDir, "package.json");
  const pkg = readJson(pkgPath) as {
    name?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  pkg.name = `@apps/${slug}`;
  pkg.scripts = {
    ...pkg.scripts,
    lint: "eslint .",
    typecheck: "tsc --noEmit",
  };
  pkg.dependencies = { ...pkg.dependencies, "@repo/ui": "workspace:*" };
  pkg.devDependencies = {
    ...pkg.devDependencies,
    "@repo/config": "workspace:*",
    eslint: "^9.14.0",
  };
  writeJson(pkgPath, pkg);

  // expo/tsconfig.base first so Expo's own settings load; ours last so its strictness wins.
  writeJson(path.join(appDir, "tsconfig.json"), {
    extends: ["expo/tsconfig.base", "@repo/config/tsconfig/react-native"],
    include: ["**/*.ts", "**/*.tsx"],
  });

  fs.writeFileSync(
    path.join(appDir, "eslint.config.mjs"),
    'import base from "@repo/config/eslint";\n\nexport default base;\n',
    "utf8",
  );

  // Metro must be told to resolve symlinked workspace packages from the repo root.
  // Do NOT set resolver.disableHierarchicalLookup here: pnpm keeps transitive deps nested
  // under .pnpm/<pkg>/node_modules, and Metro needs hierarchical lookup to find them.
  fs.writeFileSync(
    path.join(appDir, "metro.config.js"),
    [
      'const path = require("path");',
      'const { getDefaultConfig } = require("expo/metro-config");',
      "",
      'const workspaceRoot = path.resolve(__dirname, "..", "..");',
      "const config = getDefaultConfig(__dirname);",
      "",
      "config.watchFolders = [workspaceRoot];",
      "config.resolver.nodeModulesPaths = [",
      '  path.resolve(__dirname, "node_modules"),',
      '  path.resolve(workspaceRoot, "node_modules"),',
      "];",
      "",
      "module.exports = config;",
      "",
    ].join("\n"),
    "utf8",
  );

  const appJsonPath = path.join(appDir, "app.json");
  const appJson = readJson(appJsonPath) as { expo?: Record<string, unknown> };
  const expo = appJson.expo ?? {};
  const androidPackage = `com.simplemobileapps.${slug.replace(/-/g, "")}`;
  appJson.expo = {
    ...expo,
    slug,
    android: { ...(expo.android as object), package: androidPackage },
    // ios.bundleIdentifier goes here when/if iOS is added.
  };
  writeJson(appJsonPath, appJson);

  if (flavor === "backend") {
    fs.writeFileSync(
      path.join(appDir, ".env.example"),
      [
        "# Public config only - anything here ships inside the app bundle.",
        "EXPO_PUBLIC_API_URL=",
        "",
      ].join("\n"),
      "utf8",
    );
  }

  fs.writeFileSync(
    path.join(appDir, "README.md"),
    [
      `# ${slug}`,
      "",
      `Flavor: **${flavor === "offline" ? "offline-only" : "cloud backend"}**`,
      "",
      `Research doc: [docs/research/${slug}.md](../../docs/research/${slug}.md)`,
      "",
      "## Run",
      "",
      "```",
      "pnpm install",
      `pnpm --filter @apps/${slug} start`,
      "```",
      "",
      "## Checklist",
      "",
      "- [ ] Wireframes in `docs/design/`",
      "- [ ] Screens implemented",
      flavor === "backend"
        ? "- [ ] Backend chosen and `.env.example` filled in (see WORKFLOW.md)"
        : "- [ ] Local persistence chosen (AsyncStorage / SQLite)",
      "- [ ] App icon + splash",
      "- [ ] Play Store listing drafted",
      "- [ ] First EAS build (`eas build -p android --profile preview`)",
      "",
    ].join("\n"),
    "utf8",
  );
}

// Usage: pnpm blueprint:new [slug] [offline|backend] - args skip the prompts.
async function main() {
  p.intro("New app from blueprint");

  const [argSlug, argFlavor] = process.argv.slice(2);

  const slug =
    argSlug ??
    (await p.text({
      message: "App slug (kebab-case)",
      placeholder: "habit-tracker",
      validate: validateSlug,
    }));
  if (p.isCancel(slug)) return p.cancel("Cancelled.");

  const slugError = validateSlug(slug);
  if (slugError) return p.cancel(slugError);

  const appDir = path.join(appsDir, slug);
  if (fs.existsSync(appDir)) return p.cancel(`apps/${slug} already exists.`);

  const researchDoc = path.join(researchDir, `${slug}.md`);
  if (!fs.existsSync(researchDoc) && !argSlug) {
    const proceed = await p.confirm({
      message: `No docs/research/${slug}.md found. Scaffold anyway?`,
      initialValue: false,
    });
    if (p.isCancel(proceed) || !proceed) {
      return p.cancel("Run `pnpm blueprint:research` first.");
    }
  }

  const flavor =
    argFlavor ??
    ((await p.select({
      message: "Does this app need a cloud backend?",
      options: [
        { value: "offline", label: "Offline-only", hint: "all state on device" },
        { value: "backend", label: "Cloud backend", hint: "sync, accounts, or server logic" },
      ],
    })) as Flavor | symbol);
  if (p.isCancel(flavor)) return p.cancel("Cancelled.");
  if (flavor !== "offline" && flavor !== "backend") {
    return p.cancel(`Flavor must be "offline" or "backend".`);
  }

  fs.mkdirSync(appsDir, { recursive: true });

  // No spinner here - create-expo-app inherits stdio and prints its own progress.
  p.log.step("Running create-expo-app...");
  try {
    scaffoldExpoApp(slug);
  } catch {
    return p.cancel("create-expo-app failed. Check the output above.");
  }

  wireWorkspace(appDir, slug, flavor);

  p.outro(
    [
      `apps/${slug} is ready.`,
      "",
      "Next:",
      "  pnpm install",
      `  pnpm --filter @apps/${slug} start`,
    ].join("\n"),
  );
}

main();
