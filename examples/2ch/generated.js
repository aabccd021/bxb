"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReply = exports.useThreadPage = exports.useThread = exports.useReplyCreation = exports.useThreadCreation = exports.spec = exports.options = void 0;
const masmott_1 = require("masmott");
exports.options = { projectId: 'demo-2ch' };
exports.spec = {
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
};
function useThreadCreation() {
    return (0, masmott_1.useDocCreation)(exports.options, 'thread', exports.spec, exports.spec.thread.views);
}
exports.useThreadCreation = useThreadCreation;
function useReplyCreation() {
    return (0, masmott_1.useDocCreation)(exports.options, 'reply', exports.spec, exports.spec.reply.views);
}
exports.useReplyCreation = useReplyCreation;
function useThread(id) {
    return (0, masmott_1.useDoc)(exports.options, ['thread', id]);
}
exports.useThread = useThread;
function useThreadPage(id) {
    return (0, masmott_1.useDoc)(exports.options, ['thread', id], { view: 'page' });
}
exports.useThreadPage = useThreadPage;
function useReply(id) {
    return (0, masmott_1.useDoc)(exports.options, ['reply', id], undefined);
}
exports.useReply = useReply;
