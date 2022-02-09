"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextjs = exports.firestore = void 0;
const masmott_1 = require("masmott");
const _0_1_1 = require("./migration/0.1");
const next_config_1 = __importDefault(require("./next.config"));
_a = (0, masmott_1.initAndMakeFirestoreTriggers)(_0_1_1.migration, next_config_1.default), exports.firestore = _a.firestore, exports.nextjs = _a.nextjs;
//# sourceMappingURL=index.js.map