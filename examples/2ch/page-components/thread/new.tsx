import Link from "next/link";
import {
  ThreadCreation_Created,
  ThreadCreation_Creating,
  ThreadCreation_Error,
  ThreadCreation_Initial,
  ThreadCreation_NotCreated,
} from "../../generated";

const Created: ThreadCreation_Created = ({ creation: { createdDoc } }) => {
  return (
    <Link href={`/thread/${encodeURIComponent(createdDoc.id)}`}>
      <a>Go</a>
    </Link>
  );
};

const Creating: ThreadCreation_Creating = () => {
  return <>Creating</>;
};

const Error: ThreadCreation_Error = () => {
  return <>Error</>;
};

const Initial: ThreadCreation_Initial = () => {
  return <>Loading</>;
};

const NotCreated: ThreadCreation_NotCreated = ({ creation }) => {
  return (
    <>
      <button onClick={() => creation.createDoc({})}>Create</button>
    </>
  );
};

export { Created, Creating, Error, Initial, NotCreated };
