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
    // eslint-disable-next-line ts-immutable/immutable-data
    router.push(`/thread/${encodeURIComponent(createdDoc.id)}`);
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
