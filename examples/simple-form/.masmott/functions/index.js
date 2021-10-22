"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.masmott = void 0;
const app_1 = require("firebase-admin/app");
const masmott_server_1 = require("masmott-server");
const app = (0, app_1.initializeApp)();
exports.masmott = (0, masmott_server_1.makeMasmottTriggers)(app, {
    post: {
        src: {
            text: {
                type: "string",
            },
        },
        views: {},
    },
});
//# sourceMappingURL=index.js.map