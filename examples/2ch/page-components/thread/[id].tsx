import { useInput } from 'masmott';
import { TheradPageSnapshot, useReplyCreation } from '../../generated';

function ThreadDetail(thread: {
  readonly data?: { readonly replyCount: number };
  readonly id: string;
}): JSX.Element {
  const [text, setText] = useInput('');
  const replyCreation = useReplyCreation();
  return (
    <>
      <p>Thread Id : {thread.id}</p>
      <p>replyCount : {thread.data?.replyCount ?? 0}</p>
      {replyCreation.state === 'notCreated' && (
        <>
          <input type="text" value={text} onChange={setText} />
          <button onClick={() => replyCreation.createDoc({ threadId: thread.id, text })}>
            post
          </button>
        </>
      )}
      {replyCreation.state === 'created' && (
        <>
          <p>id: {replyCreation.createdDoc.id}</p>
          <p>text: {replyCreation.createdDoc.data.text}</p>
        </>
      )}
    </>
  );
}

export default function Page({
  snapshot,
}: {
  readonly snapshot?: TheradPageSnapshot;
}): JSX.Element {
  return (
    <>
      {snapshot === undefined && <p>Loading</p>}
      {snapshot !== undefined && (
        <>
          {snapshot.doc.state === 'error' && <><p>Error gan</p><p>{JSON.stringify(snapshot)}</p></>}
          {snapshot.doc.state === 'fetching' && <p>Fetching gan</p>}
          {snapshot.doc.state === 'loaded' && !snapshot.doc.exists && <p>Gaada gan</p>}
          {snapshot.doc.state === 'loaded' && snapshot.doc.exists && (
            <ThreadDetail data={snapshot.doc.data} id={snapshot.id} />
          )}
        </>
      )}
    </>
  );
}
