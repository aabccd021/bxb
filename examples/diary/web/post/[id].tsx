import type { PostPageData } from '@masmott';
import type { ISRPage } from 'masmott';

export const Page: ISRPage<PostPageData> = ({ snapshot }) => {
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
            <>
              {' '}
              <div>Title: {snapshot.doc.data.title}</div>
              <div>Text: {snapshot.doc.data.text}</div>
            </>
          )}
        </>
      )}
    </>
  );
};
