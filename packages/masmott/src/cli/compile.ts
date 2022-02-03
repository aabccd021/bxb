/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */
import * as fs from 'fs';
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

import { runCmd } from './runCmd';

export const compile = (outDir: string, fileName: string, fileContent: string) => {
  const absoluteOutDir = `.masmott/${outDir}/`;
  const fullFileName = `${fileName}.ts`;
  fs.rmSync(absoluteOutDir, { force: true, recursive: true });

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
    outDir: absoluteOutDir,
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
    getSourceFile: (sourceFileName, languageVersion) =>
      fullFileName === sourceFileName
        ? createSourceFile(fullFileName, fileContent, target)
        : defaultCompilerHost.getSourceFile(sourceFileName, languageVersion),
  };

  const program = createProgram([fullFileName], options, customCompilerHost);
  const emitResult = program.emit();

  const allDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      if (diagnostic.start === undefined) {
        throw Error('Absurd');
      }
      const { line, character } = getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });
  return emitResult.emitSkipped ? 1 : 0;
};

export const compileAndRunCLI = (name: string) => {
  const content = `
import { ${name} } from 'masmott';
import { masmott } from './masmott.config';

${name}(masmott);
`;
  const exit1 = compile(`cli/${name}`, 'index', content);
  if (exit1 !== 0) {
    return exit1;
  }
  return runCmd(`node ./.masmott/cli/${name}/index.js`);
};
