"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var fs_1 = require("fs");
var typescript_1 = require("typescript");
var indexContent = "import { makeFunctions } from 'masmott/server';\nimport conf from './next.config';\n\nconst { nextjs, firestore } = makeFunctions(conf, {\n  thread: {\n    src: {},\n    views: {\n      page: {\n        selectedFieldNames: [],\n        joinSpecs: {},\n        countSpecs: {\n          replyCount: {\n            countedCollectionName: 'reply',\n            groupBy: 'threadId',\n          },\n        },\n      },\n    },\n  },\n  reply: {\n    src: {\n      threadId: {\n        type: 'refId',\n        refCollection: 'thread',\n      },\n      text: {\n        type: 'string',\n      },\n    },\n    views: {},\n  },\n});\n\nexport { nextjs, firestore };\n";
var indexFileName = 'index.ts';
var nextConfigFileName = 'next.config.js';
var outputFolder = '.functions';
if ((0, fs_1.existsSync)(outputFolder)) {
    (0, fs_1.rmSync)(outputFolder, { recursive: true });
}
var target = typescript_1.ScriptTarget.ES2017;
var options = {
    module: typescript_1.ModuleKind.CommonJS,
    noImplicitReturns: true,
    noUnusedLocals: true,
    outDir: outputFolder,
    sourceMap: true,
    strict: true,
    target: target,
    allowJs: true,
    esModuleInterop: true,
    skipLibCheck: true
};
var defaultCompilerHost = (0, typescript_1.createCompilerHost)(options);
var customCompilerHost = __assign(__assign({}, defaultCompilerHost), { getSourceFile: function (name, languageVersion) {
        if (name === indexFileName) {
            return (0, typescript_1.createSourceFile)(indexFileName, indexContent, target);
        }
        return defaultCompilerHost.getSourceFile(name, languageVersion);
    } });
var program = (0, typescript_1.createProgram)([indexFileName, nextConfigFileName], options, customCompilerHost);
var emitResult = program.emit();
var allDiagnostics = (0, typescript_1.getPreEmitDiagnostics)(program).concat(emitResult.diagnostics);
allDiagnostics.forEach(function (diagnostic) {
    if (diagnostic.file) {
        var _a = (0, typescript_1.getLineAndCharacterOfPosition)(diagnostic.file, diagnostic.start), line = _a.line, character = _a.character;
        var message = (0, typescript_1.flattenDiagnosticMessageText)(diagnostic.messageText, '\n');
        console.log(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
    }
    else {
        console.log((0, typescript_1.flattenDiagnosticMessageText)(diagnostic.messageText, '\n'));
    }
});
var exitCode = emitResult.emitSkipped ? 1 : 0;
console.log("Process exiting with code '" + exitCode + "'.");
process.exit(exitCode);
