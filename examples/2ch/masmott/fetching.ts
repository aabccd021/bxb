import { getFirestore } from "firebase-admin/firestore";
import { GetStaticPaths, GetStaticProps } from "next";
import { DocSnapshot, ISRPageProps, ViewPath } from ".";
import { makeCollectionPath, makeDocPath } from "./util";

export function makeGetStaticPaths(): GetStaticPaths {
  return () => ({ paths: [], fallback: true });
}

export function makeGetStaticProps(
  path: ViewPath
): GetStaticProps<ISRPageProps> {
  return async ({ params }) => {
    const id = params?.["id"];
    if (typeof id !== "string") {
      return {
        notFound: true,
        revalidate: 60,
      };
    }
    const [collection, viewName] = path;
    const collectionPath = makeCollectionPath(collection, viewName);
    const docPath = makeDocPath(collection, id, viewName);
    const snapshot = await getFirestore()
      .collection(collectionPath)
      .doc(id)
      .get();
    const data = snapshot.data();
    const doc: DocSnapshot =
      data !== undefined ? { exists: true, data } : { exists: false };
    return {
      props: {
        fallback: { [docPath]: doc },
      },
      revalidate: 60,
    };
  };
}
