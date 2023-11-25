import esbuildPluginHtml from "@chialab/esbuild-plugin-html";
import browserslistToEsbuild from "browserslist-to-esbuild";
import * as chokidar from "chokidar";
import * as esbuild from "esbuild";
import * as fs from "node:fs/promises";
import { Worker } from "node:worker_threads";
import {
  ManagedContext,
  hasCliFlag,
  reportJsException,
  reportTsDiagnostic,
  resolveBuildScriptPath,
} from "./esbuild-utils.mjs";

// build system implementation begins here.
// You're welcome to look and modify to your needs!

const OUT_DIR = "public";
const runCleanStep = hasCliFlag("--clean");
const runBuildWatcher = hasCliFlag("--watch");
const runLocalServer = hasCliFlag("--serve");
const runTypescriptWatcher = runBuildWatcher;

if (runCleanStep) {
  console.info("Cleaning existing build artifacts...");
  await fs.rm("./public", { recursive: true, force: true });
}

/**
 * @type {esbuild.BuildOptions}
 */
const esbuildConfig = {
  // JS bundling settings
  bundle: true,
  outdir: OUT_DIR,
  sourcemap: true,
  // loads browserslist from package.json or .browserslistrc
  target: browserslistToEsbuild(),
  define: {
    _LIVE_RELOAD_: String(runBuildWatcher && runLocalServer),
  },

  // html bundling settings
  // in the future, esbuild may implement this feature natively:
  // https://github.com/evanw/esbuild/issues/31
  plugins: [esbuildPluginHtml()],
  assetNames: "assets/[name]-[hash]",
  chunkNames: "[ext]/[name]-[hash]",
  logLevel: "warning",
};

const ctx = new ManagedContext(esbuildConfig);
const watcher = chokidar.watch("src");
watcher.on("error", reportJsException);
watcher.on("add", (file) => ctx.tryAddEntryPoint(file));
watcher.on("unlink", (file) => ctx.tryRemoveEntryPoint(file));

let numServices = 0;
if (runLocalServer) {
  numServices++;
  ctx.enableLocalServer({ servedir: OUT_DIR });
}

if (runBuildWatcher) {
  numServices++;
  watcher.on("ready", async () => {
    await ctx.recreateContext();

    // only listen for changes after initial setup
    // if file is added or removed, check to see if we need to recreate our context.
    watcher.on("change", () => ctx.rebuild());
    watcher.on("add", async () => {
      await ctx.recreateContext();
      await ctx.rebuild();
    });
    watcher.on("unlink", async () => {
      await ctx.recreateContext();
      await ctx.rebuild();
    });

    await ctx.rebuild();
  });
} else {
  // run build once on ready and wait for it to resolve
  await new Promise((resolve) => {
    watcher.on("ready", async () => {
      await ctx.recreateContext();
      await ctx.rebuild();
      await watcher.close();
      resolve();
    });
  });
}

if (runTypescriptWatcher) {
  numServices++;
  console.info("Running typescript watcher in background...");
  const tsWorker = new Worker(
    resolveBuildScriptPath(import.meta.url, "./typescript.mjs")
  );
  tsWorker.on("message", reportTsDiagnostic);
}

if (numServices === 0) {
  // shut down
  await ctx.dispose();
}
