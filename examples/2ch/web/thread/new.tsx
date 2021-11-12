import type { DocCreation } from 'masmott';
import { useRouter } from 'next/dist/client/router';
import { useEffect } from 'react';
import type { ThreadData } from '../../generated';
import { useThreadCreation } from '../../generated';

type Props = {
  readonly creation: DocCreation.Created<ThreadData>;
};

function Created({ creation: { createdDoc } }: Props): JSX.Element {
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
        <button
          onClick={(): void => {
            creation.createDoc({});
          }}
        >
          Create
        </button>
      )}

      {creation.state === 'created' && <Created creation={creation} />}
    </>
  );
}
