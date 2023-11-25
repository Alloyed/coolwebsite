import * as esbuild from "esbuild";
import * as path from "node:path";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";

/**
 * @param {Error} error
 */
export function reportJsException(error) {
  esbuild
    .formatMessages(
      [
        {
          pluginName: "watcher",
          text: error.message,
          detail: error.stack,
        },
      ],
      {
        kind: "error",
        color: true,
      }
    )
    .then((messages) => messages.map((m) => console.error(m)));
}

export function reportTsDiagnostic(diagnostic) {
  esbuild
    .formatMessages(
      [
        {
          pluginName: "typescript",
          id: diagnostic.id,
          text: diagnostic.text,
          location: diagnostic.location,
        },
      ],
      {
        kind: diagnostic.kind,
        color: true,
      }
    )
    .then((messages) =>
      messages.map((m) =>
        (diagnostic.kind === "error" ? console.error : console.warn)(m)
      )
    );
}

export function resolveBuildScriptPath(url, relativePath) {
  return path.resolve(path.dirname(fileURLToPath(url)), relativePath);
}

export function hasCliFlag(flagString) {
  return argv.indexOf(flagString) !== -1;
}

/**
 * Managed context tracks our context object and entry points for us.
 * If the set of entry points change, we'll need to recreate our context object.
 */
export class ManagedContext {
  // config
  config = undefined;
  serverConfig = undefined;
  constructor(config) {
    this.config = config;
  }

  // Entry points
  entryPointSet = new Set();
  tryAddEntryPoint(filename) {
    if (filename.endsWith(".html")) {
      this.entryPointSet.add(filename);
    }
  }
  tryRemoveEntryPoint(filename) {
    if (filename.endsWith(".html")) {
      this.entryPointSet.delete(filename);
    }
  }
  get entryPoints() {
    return Array.from(this.entryPointSet);
  }

  context = undefined;
  lastEntryPoints = undefined;
  async recreateContext() {
    const newEntryPoints = this.entryPoints;
    if (this.lastEntryPoints !== newEntryPoints) {
      console.info("Entry points detected:\n" + newEntryPoints.join("\n"));
      this.lastEntryPoints = newEntryPoints;
      if (this.context) {
        await this.context.dispose();
      }
      this.context = await esbuild.context({
        entryPoints: newEntryPoints,
        ...this.config,
      });
      if (this.serverConfig) {
        const { port } = await this.context.serve(this.serverConfig);
        // VSCode listens for this message specifically to automatically start up a chrome tab
        console.info(`listening on http://localhost:${port}`);
      }
    }
  }

  async rebuild() {
    try {
      // cancel any existing builds in progress
      await this.context.cancel();

      console.info("Bundling");
      await this.context.rebuild();
      console.info("Bundle complete!");
    } catch (e) {
      // html plugin throws if a css/js file has errors in it. We'll pretend
      // that didn't happen, and assume the error was reported up the chain.
    }
  }

  /**
   * enable local server on context creation. The server will be brought down
   * and recreated whenever the entry points change.
   * @param {esbuild.ServeOptions} options
   */
  enableLocalServer(config) {
    this.serverConfig = config;
  }

  dispose() {
    return this.context.dispose();
  }
}
