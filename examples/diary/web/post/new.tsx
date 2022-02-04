import type { PostData } from '@/masmott.generated';
import { usePostCreation } from '@/masmott.generated';
import type { CreatedWithPage } from 'masmott/dist/cjs/client/types/doc-creation';
import type { NextPage } from 'next';
import { useEffect } from 'react';


const Created = ({ creation }: { readonly creation: CreatedWithPage<PostData> }) => {
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

const Home: NextPage = () => {
  return <A />;
};

export default Home;
