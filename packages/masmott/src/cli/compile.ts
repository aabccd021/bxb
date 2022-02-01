/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import { Dict } from 'core';
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

export const compile = (outDir: string, files: Dict<string>) => {
  const target = ScriptTarget.ES2017;

  const options: CompilerOptions = {
    allowJs: true,
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
    outDir,
    skipLibCheck: true,
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
    getSourceFile: (fileName, languageVersion) => {
      const fileContent = files[fileName];
      return fileContent === undefined
        ? defaultCompilerHost.getSourceFile(fileName, languageVersion)
        : createSourceFile(fileName, fileContent, target);
    },
  };

  const program = createProgram(
    [...Object.keys(files)],
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
};
