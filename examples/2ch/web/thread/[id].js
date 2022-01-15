"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const masmott_1 = require("masmott");
const generated_1 = require("../../generated");
function ThreadDetail(thread) {
    var _a, _b;
    const [text, setText] = (0, masmott_1.useInput)('');
    const replyCreation = (0, generated_1.useReplyCreation)();
    return (<>
      <p>Thread Id : {thread.id}</p>
      <p>replyCount : {(_b = (_a = thread.data) === null || _a === void 0 ? void 0 : _a.replyCount) !== null && _b !== void 0 ? _b : 0}</p>
      {replyCreation.state === 'notCreated' && (<>
          <input type="text" value={text} onChange={setText}/>
          <button onClick={() => {
                replyCreation.createDoc({ threadId: thread.id, text });
            }}>
            post
          </button>
        </>)}
      {replyCreation.state === 'created' && (<>
          <p>id: {replyCreation.createdDoc.id}</p>
          <p>text: {replyCreation.createdDoc.data.text}</p>
        </>)}
    </>);
}
function Page({ snapshot, }) {
    return (<>
      {snapshot === undefined && <p>Loading</p>}
      {snapshot !== undefined && (<>
          {snapshot.doc.state === 'error' && (<>
              <p>Error gan</p>
              <p>{JSON.stringify(snapshot)}</p>
            </>)}
          {snapshot.doc.state === 'fetching' && <p>Fetching gan</p>}
          {snapshot.doc.state === 'loaded' && !snapshot.doc.exists && <p>Gaada gan</p>}
          {snapshot.doc.state === 'loaded' && snapshot.doc.exists && (<ThreadDetail data={snapshot.doc.data} id={snapshot.id}/>)}
        </>)}
    </>);
}
exports.default = Page;
