import type { DocCreation, PostData } from '@masmott';
import { usePostCreation } from '@masmott';
import { useEffect } from 'react';

const Created = ({ creation }: { readonly creation: DocCreation.CreatedWithPage<PostData> }) => {
  useEffect(() => {
    creation.redirect();
  }, [creation]);
  return <div>Loading</div>;
};

const A = (): JSX.Element => {
  const docCreation = usePostCreation();

  if (docCreation.state === 'initial') {
    return <div>Loading</div>;
  }
  if (docCreation.state === 'creating') {
    return <div>creating</div>;
  }
  if (docCreation.state === 'error') {
    return <div>error: {JSON.stringify(docCreation.reason)}</div>;
  }
  if (docCreation.state === 'notCreated') {
    return (
      <>
        <div>Not created</div>
        <button
          onClick={() => {
            docCreation.createDoc({ text: 'tekisuto', title: 'taitoru' });
          }}
        >
          Create
        </button>
      </>
    );
  }
  return <Created creation={docCreation} />;
};

export const Page = () => {
  return <A />;
};
