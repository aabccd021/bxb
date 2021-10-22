import type { NextPage } from "next";
import { usePost, usePostCreation } from "./generated";

function PostCard(props: { readonly id: string }): JSX.Element {
  const post = usePost(props.id);
  return (
    <>
      {post.state === "error" && "Error"}
      {post.state === "fetching" && "Error"}
      {post.state === "loaded" && "Error"}
    </>
  );
}

function Form(): JSX.Element {
  const postCreation = usePostCreation();
  return (
    <>
      {postCreation.state === "notCreated" && (
        <>
          <button onClick={() => postCreation.createDoc({ text: "yaa" })}>
            Create
          </button>
        </>
      )}
      {postCreation.state === "creating" && <>Creating</>}
      {postCreation.state === "error" && <>Error</>}
      {postCreation.state === "initial" && <>Loading</>}
      {postCreation.state === "created" && <PostCard id={postCreation.id} />}
    </>
  );
}

const Home: NextPage = () => {
  return (
    <>
      <Form />
    </>
  );
};

export default Home;
