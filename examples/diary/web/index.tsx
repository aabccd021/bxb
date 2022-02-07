import { usePostCreation } from '@masmott';
import type { NextPage } from 'next';

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
          className="text-3xl"
          onClick={() => {
            docCreation.createDoc({ text: 'textt', title: 'titlee' });
          }}
        >
          Create
        </button>
      </>
    );
  }
  const { createdDoc } = docCreation;
  return (
    <>
      <div>text: {createdDoc.data.text}</div>
      <div>title: {createdDoc.data.title}</div>
    </>
  );
};

export const Page: NextPage = () => {
  return <A />;
};
