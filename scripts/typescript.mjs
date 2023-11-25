import { parentPort } from "node:worker_threads";
import ts from "typescript";

/**
 * This is derived from the official typescript docs:
 * https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#writing-an-incremental-program-watcher
 * This uses typescript's built-in node-js watcher support, which is a bit
 * redundant because we have a filesystem watcher running in our parent thread.
 * TODO: explore one-off/incremental builds instead
 */

/** @type ts.FormatDiagnosticsHost */

const configPath = ts.findConfigFile(
  /*searchPath*/ "./",
  ts.sys.fileExists,
  "tsconfig.json"
);
if (!configPath) {
  throw new Error("Could not find a valid 'tsconfig.json'.");
}

const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

const additionalOptions = {};
// Note that there is another overload for `createWatchCompilerHost` that takes
// a set of root files.
const host = ts.createWatchCompilerHost(
  configPath,
  additionalOptions,
  ts.sys,
  createProgram,
  reportDiagnostic,
  reportWatchStatusChanged
);

// `createWatchProgram` creates an initial program, watches files, and updates
// the program over time.
ts.createWatchProgram(host);

/**
 * push diagnostic to parent thread
 * @param {ts.Diagnostic} diagnostic
 */
function reportDiagnostic(diagnostic) {
  const flattenedMessageText = ts.flattenDiagnosticMessageText(
    diagnostic.messageText,
    ts.sys.newLine
  );
  let location;
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(
      diagnostic.file,
      diagnostic.start
    );
    const lineStart = diagnostic.file.getPositionOfLineAndCharacter(line, 0);
    const lineEnd = diagnostic.file.getLineEndOfPosition(diagnostic.start);
    const lineText = diagnostic.file.getFullText().slice(lineStart, lineEnd);
    location = {
      file: diagnostic.file.fileName,
      line: line + 1, // +1 to match editor lines
      column: character, // not +1 for reasons, I guess??
      length: diagnostic.length,
      lineText: lineText,
    };
  }
  parentPort.postMessage({
    text: flattenedMessageText,
    kind:
      diagnostic.category === ts.DiagnosticCategory.Error ? "error" : "warning",
    id: "ts" + String(diagnostic.code),
    location,
  });
}

function reportWatchStatusChanged(diagnostic) {
  //Skipping this for less spammy results
}
