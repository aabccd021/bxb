import { useRouter } from 'next/dist/client/router';
import { useEffect } from 'react';
import { ThreadData, useThreadCreation } from '../../generated';
import { DocCreation } from '../../masmott';

function Created({
  creation: { createdDoc },
}: {
  readonly creation: DocCreation.Created<ThreadData>;
}): JSX.Element {
  const router = useRouter();
  useEffect(() => {
    router.push(`/thread/${encodeURIComponent(createdDoc.id)}?useLocalData=true`);
  }, [router, createdDoc.id]);

  return <p>Redirecting</p>;
}

export default function Page(): JSX.Element {
  const creation = useThreadCreation();
  return (
    <>
      {creation.state === 'notCreated' && (
        <button onClick={() => creation.createDoc({})}>Create</button>
      )}

      {creation.state === 'created' && <Created creation={creation} />}
    </>
  );
}
