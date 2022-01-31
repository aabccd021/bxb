/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
// eslint-disable-next-line functional/no-return-void

import { existsSync, rmSync } from 'fs';
import {
  CompilerHost,
  CompilerOptions,
  createCompilerHost,
  createProgram,
  createSourceFile,
  flattenDiagnosticMessageText,
  getLineAndCharacterOfPosition,
  getPreEmitDiagnostics,
  ModuleKind,
  ScriptTarget,
} from 'typescript';

export function build(): void {
  const indexContent = `
import { initAndMakeFirestoreTriggers } from 'masmott';
import { masmott } from './masmott';

export const triggers = initAndMakeFirestoreTriggers(masmott);
`;
  const functionsIndexFileName = 'index.ts';

  const outputFolder = 'masmott/functions';

  if (existsSync(outputFolder)) {
    rmSync(outputFolder, { recursive: true });
  }

  const target = ScriptTarget.ES2017;

  const options: CompilerOptions = {
    allowUnreachableCode: true,
    allowUnusedLabels: true,
    alwaysStrict: true,
    esModuleInterop: true,
    exactOptionalPropertyTypes: true,
    module: ModuleKind.CommonJS,
    noFallthroughCasesInSwitch: true,
    noImplicitAny: true,
    noImplicitOverride: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noPropertyAccessFromIndexSignature: true,
    noUncheckedIndexedAccess: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    outDir: outputFolder,
    sourceMap: true,
    strict: true,
    strictBindCallApply: true,
    strictFunctionTypes: true,
    strictNullChecks: true,
    strictPropertyInitialization: true,
    target,
    useUnknownInCatchVariables: true,
  };

  const defaultCompilerHost = createCompilerHost(options);

  const customCompilerHost: CompilerHost = {
    ...defaultCompilerHost,
    getSourceFile: (name, languageVersion) =>
      name === functionsIndexFileName
        ? createSourceFile(functionsIndexFileName, indexContent, target)
        : defaultCompilerHost.getSourceFile(name, languageVersion),
  };

  const program = createProgram(
    [functionsIndexFileName, 'masmott.ts'],
    options,
    customCompilerHost
  );
  const emitResult = program.emit();

  const allDiagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics
  );

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      if (diagnostic.start === undefined) {
        throw Error('Absurd');
      }
      const { line, character } = getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start
      );
      const message = flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}
