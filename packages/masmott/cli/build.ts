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
	ScriptTarget
} from 'typescript';

export function build(): void {

const indexContent = `import { makeFunctions } from 'masmott/server';
import conf from './next.config';

const { nextjs, firestore } = makeFunctions(conf, {
  thread: {
    src: {},
    views: {
      page: {
        selectedFieldNames: [],
        joinSpecs: {},
        countSpecs: {
          replyCount: {
            countedCollectionName: 'reply',
            groupBy: 'threadId',
          },
        },
      },
    },
  },
  reply: {
    src: {
      threadId: {
        type: 'refId',
        refCollection: 'thread',
      },
      text: {
        type: 'string',
      },
    },
    views: {},
  },
});

export { nextjs, firestore };
`;
const indexFileName = 'index.ts';
const nextConfigFileName = 'next.config.js';

const outputFolder = '.functions';

if (existsSync(outputFolder)) {
  rmSync(outputFolder, { recursive: true });
}

const target = ScriptTarget.ES2017;

const options: CompilerOptions = {
  module: ModuleKind.CommonJS,
  noImplicitReturns: true,
  noUnusedLocals: true,
  outDir: outputFolder,
  sourceMap: true,
  strict: true,
  target,
  allowJs: true,
  esModuleInterop: true,
  skipLibCheck: true,
};

const defaultCompilerHost = createCompilerHost(options);

const customCompilerHost: CompilerHost = {
  ...defaultCompilerHost,
  getSourceFile: (name, languageVersion) => {
    if (name === indexFileName) {
      return createSourceFile(indexFileName, indexContent, target);
    }
    return defaultCompilerHost.getSourceFile(name, languageVersion);
  },
};

const program = createProgram([indexFileName, nextConfigFileName], options, customCompilerHost);
const emitResult = program.emit();

const allDiagnostics = getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

allDiagnostics.forEach((diagnostic) => {
  if (diagnostic.file) {
    const { line, character } = getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
    const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.log(flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
});

const exitCode = emitResult.emitSkipped ? 1 : 0;
console.log(`Process exiting with code '${exitCode}'.`);
process.exit(exitCode);

}