import { TheradPageSnapshot, useReplyCreation, useThread } from '../../generated';
import { useInput } from '../../masmott';

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

function PageOnThreadNotExists({ id }: { readonly id: string }): JSX.Element {
  const thread = useThread(id);
  return (
    <>
      {thread.state === 'error' && <p>Error gan</p>}
      {thread.state === 'fetching' && <p>Fetching gan</p>}

      {thread.state === 'loaded' && !thread.exists && <PageOnThreadNotExists id={id} />}
      {thread.state === 'loaded' && thread.exists && <ThreadDetail id={id} />}
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
          {snapshot.doc.state === 'error' && <p>Error gan</p>}
          {snapshot.doc.state === 'fetching' && <p>Fetching gan</p>}
          {snapshot.doc.state === 'loaded' && !snapshot.doc.exists && (
            <PageOnThreadNotExists id={snapshot.id} />
          )}
          {snapshot.doc.state === 'loaded' && snapshot.doc.exists && (
            <ThreadDetail data={snapshot.doc.data} id={snapshot.id} />
          )}
        </>
      )}
    </>
  );
}
