/* eslint-disable functional/no-conditional-statement */
import { getFirestore } from 'firebase-admin/firestore';
import {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticProps,
  GetStaticPropsResult,
} from 'next';

import { DocSnapshot, ISRPageProps, ViewPath } from '../client/types';
import { makeCollectionPath, makeDocPath } from '../client/util';

export function makeGetStaticPaths(): GetStaticPaths {
  return (): GetStaticPathsResult => ({ fallback: true, paths: [] });
}

export function makeGetStaticProps(
  path: ViewPath
): GetStaticProps<ISRPageProps> {
  return async ({ params }): Promise<GetStaticPropsResult<ISRPageProps>> => {
    const id = params?.['id'];
    if (typeof id !== 'string') {
      return {
        notFound: true,
        revalidate: 60,
      };
    }
    if (process.env['NODE_ENV'] === 'development') {
      return {
        props: { fallback: {} },
        revalidate: 60,
      };
    }
    const [collection, view] = path;
    const collectionPath = makeCollectionPath(collection, view);
    const docPath = makeDocPath(collection, id, view);
    const snapshot = await getFirestore()
      .collection(collectionPath)
      .doc(id)
      .get();
    const data = snapshot.data();
    const doc: DocSnapshot =
      data !== undefined ? { data, exists: true } : { exists: false };
    return {
      props: {
        fallback: { [docPath]: doc },
      },
      revalidate: 60,
    };
  };
}
