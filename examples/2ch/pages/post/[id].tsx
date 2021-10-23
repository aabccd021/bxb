// import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.["id"];
  if (typeof id !== "string") {
    return { notFound: true };
  }
  const snapshot = await getFirestore().collection("post").doc(id).get();
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
