import { ThreadPageData, useReplyCreation } from "../../generated";
import { useInput } from "../../masmott";
import { LoadedExistsComponent } from "../../masmott/doc";
import { PageComponents } from "../../masmott/isr";

const LoadedExists: LoadedExistsComponent<ThreadPageData> = (thread) => {
  const [text, setText] = useInput("");
  const replyCreation = useReplyCreation();
  return (
    <>
      <p>Thread Id : {thread.id}</p>
      <p>replyCount : {thread.doc.data.replyCount}</p>
      {replyCreation.state === "notCreated" && (
        <>
          <input type="text" value={text} onChange={setText} />
          <button
            onClick={() =>
              replyCreation.createDoc({ threadId: thread.id, text })
            }
          >
            post
          </button>
        </>
      )}
      {replyCreation.state === "created" && (
        <>
          <p>id: {replyCreation.createdDoc.id}</p>
          <p>text: {replyCreation.createdDoc.data.text}</p>
        </>
      )}
    </>
  );
};

export const components: PageComponents<ThreadPageData> = {
  Error: () => <div>Error</div>,
  Fetching: () => <div>Fetching</div>,
  LoadedExists,
  LoadedNotExists: () => <div>LoadedNotExists</div>,
  RouterLoading: () => <div>RouterLoading</div>,
};
