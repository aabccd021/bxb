import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GetServerSideProps, NextPage } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.["id"];
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }
  const app = initializeApp({ projectId: "demo-simple-form" });
  const firestore = getFirestore(app);
  const snapshot = await firestore.collection("post").doc(id).get();
  return {
    props: {
      data: snapshot.data()?.["text"],
    },
  };
};

const PostPage: NextPage<{ readonly data: string | undefined }> = ({
  data,
}) => {
  return <> {data !== undefined ? data : "empty gan"}</>;
};

export default PostPage;
