import {
  ThreadCreation_Created,
  ThreadCreation_Creating,
  ThreadCreation_Error,
  ThreadCreation_Initial,
  ThreadCreation_NotCreated,
} from "../../generated";
import { useInput } from "../../masmott";

const Created: ThreadCreation_Created = () => {
  return <>Created</>;
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
  const [text, setText] = useInput("");
  return (
    <>
      <input type="text" value={text} onChange={setText} />
      <button onClick={() => creation.createDoc({})}>Create</button>
    </>
  );
};

export { Created, Creating, Error, Initial, NotCreated };
