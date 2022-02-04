/* eslint-disable functional/no-conditional-statement */
import { getFirestore } from 'firebase-admin/firestore';
import { GetStaticPaths, GetStaticProps, GetStaticPropsResult } from 'next';

import { DocSnapshot, ISRPageProps } from '../client/types';
import { makeCollectionPath, makeDocPath } from '../client/util';

export const makeGetStaticPaths = (): GetStaticPaths => () => ({ fallback: true, paths: [] });

export const makeGetStaticProps =
  (collection: string): GetStaticProps<ISRPageProps> =>
  async ({ params }): Promise<GetStaticPropsResult<ISRPageProps>> => {
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
    const collectionPath = makeCollectionPath(collection, 'page');
    const docPath = makeDocPath(collection, id, 'page');
    const snapshot = await getFirestore().collection(collectionPath).doc(id).get();
    const data = snapshot.data();
    const doc: DocSnapshot = data !== undefined ? { data, exists: true } : { exists: false };
    return {
      props: {
        fallback: { [docPath]: doc },
      },
      revalidate: 60,
    };
  };
