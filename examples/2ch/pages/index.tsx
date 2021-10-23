import type { NextPage } from "next";
import { PostCreationData, usePost, usePostCreation } from "../generated";
import { DocCreation_NotCreated } from "../masmott/types";
import { useInput } from "../masmott/use-input";

function PostCard(props: { readonly id: string }): JSX.Element {
  const post = usePost(props.id);
  return (
    <>
      {post.state === "error" && "Error"}
      {post.state === "fetching" && "Fetching"}
      {post.state === "loaded" && post.exists && (
        <>
          <p>text: </p>
          <p>{post.data.text}</p>
        </>
      )}
    </>
  );
}

function Form(props: {
  readonly postCreation: DocCreation_NotCreated<PostCreationData>;
}): JSX.Element {
  const [text, setText] = useInput("");
  return (
    <>
      <input type="text" value={text} onChange={setText} />
      <button onClick={() => props.postCreation.createDoc({ text })}>
        Create
      </button>
    </>
  );
}

const Home: NextPage = () => {
  const postCreation = usePostCreation();
  return (
    <>
      {postCreation.state === "notCreated" && <Form {...{ postCreation }} />}
      {postCreation.state === "creating" && <>Creating</>}
      {postCreation.state === "error" && <>Error</>}
      {postCreation.state === "initial" && <>Loading</>}
      {postCreation.state === "created" && (
        <>
          <p>data:</p>
          <p>{JSON.stringify(postCreation.createdDoc.data)}</p>
          <p>card:</p>
          <PostCard id={postCreation.createdDoc.id} />
          <button onClick={postCreation.reset}>reset</button>
        </>
      )}
    </>
  );
};

export default Home;
