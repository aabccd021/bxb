import type { Doc, ISRPage } from 'masmott';

const Page: ISRPage = ({
  snapshot,
}: {
  readonly snapshot?: {
    readonly doc: Doc.Type;
    readonly id: string;
  };
}) => {
  return (
    <>
      {snapshot === undefined && <p>Loading</p>}
      {snapshot !== undefined && (
        <>
          {snapshot.doc.state === 'error' && (
            <>
              <p>Error gan</p>
              <p>{JSON.stringify(snapshot)}</p>
            </>
          )}
          {snapshot.doc.state === 'fetching' && <p>Fetching gan</p>}
          {snapshot.doc.state === 'loaded' && !snapshot.doc.exists && <p>Gaada gan</p>}
          {snapshot.doc.state === 'loaded' && snapshot.doc.exists && (
            <div>{JSON.stringify(snapshot)}</div>
          )}
        </>
      )}
    </>
  );
};

export default Page;
