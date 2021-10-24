import type { NextPage } from "next";
import {
  ThreadCreation_NotCreatedComponent,
  useThreadCreation,
} from "../generated";
import { useInput } from "../masmott/use-input";

const Form: ThreadCreation_NotCreatedComponent = (props) => {
  const [text, setText] = useInput("");
  return (
    <>
      <input type="text" value={text} onChange={setText} />
      <button onClick={() => props.creation.createDoc({})}>Create</button>
    </>
  );
};

const Home: NextPage = () => {
  const creation = useThreadCreation();
  return (
    <>
      {creation.state === "notCreated" && <Form creation={creation} />}
      {creation.state === "creating" && <>Creating</>}
      {creation.state === "error" && <>Error</>}
      {creation.state === "initial" && <>Loading</>}
      {creation.state === "created" && (
        <>
          <p>data:</p>
          <p>{JSON.stringify(creation.createdDoc.data)}</p>
          <p>card:</p>
          <button onClick={creation.reset}>reset</button>
        </>
      )}
    </>
  );
};

export default Home;
