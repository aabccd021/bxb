import { ThreadCreation_NotCreated as ThreadCreation_NotCreated } from "../../../generated";
import { useInput } from "../../../masmott";

export const NotCreated: ThreadCreation_NotCreated = ({ creation }) => {
  const [text, setText] = useInput("");
  return (
    <>
      <input type="text" value={text} onChange={setText} />
      <button onClick={() => creation.createDoc({})}>Create</button>
    </>
  );
};
