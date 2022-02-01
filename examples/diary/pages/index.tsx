import { FirebaseOptions, useDocCreation } from 'masmott';
import { NextPage } from 'next';

const options: FirebaseOptions = {
  projectId: 'demo-diary',
};

const A = (): JSX.Element => {
  const docCreation = useDocCreation(options, 'post');

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
          onClick={() =>
            docCreation.createDoc({
              text: 'textt',
              title: 'tiltee',
            })
          }
        >
          Create
        </button>
      </>
    );
  }
  if (docCreation.state === 'created') {
    return <div>created: {JSON.stringify(docCreation.createdDoc)}</div>;
  }
  return <div>Fatal Error</div>;
};

const Home: NextPage = () => {
  return <A />;
};

export default Home;
