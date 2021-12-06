import {
  GetDocsAction,
  WhereQuerySpec,
  WriteDocAction,
  WriteResult,
} from '@server/type';
import { CollectionReference, getFirestore } from 'firebase-admin/firestore';
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';

type Queryable = FirebaseFirestore.Query | CollectionReference;

/**
 *
 */
const toCollectionRef = (collection: string) =>
  getFirestore().collection(collection);

/**
 *
 */
const toCollectionQuery =
  (nullableWhereSpecs: readonly WhereQuerySpec[] | undefined) =>
  (collectionRef: CollectionReference) =>
    pipe(
      O.fromNullable(nullableWhereSpecs),
      O.map(
        flow(
          A.reduce<WhereQuerySpec, Queryable>(
            collectionRef,
            (collectionQueryAcc, whereSpec) =>
              collectionQueryAcc.where(whereSpec[0], whereSpec[1], whereSpec[2])
          )
        )
      ),
      O.getOrElseW(() => collectionRef)
    );

/**
 *
 */
export const getDocs = ({ collection, where }: GetDocsAction) =>
  pipe(
    collection,
    toCollectionRef,
    toCollectionQuery(where),
    (query) => () => query.get(),
    T.map(
      flow(
        (querySnapshot) => querySnapshot.docs,
        A.map((docSnapshot) => ({
          data: docSnapshot.data() ?? {},
          id: docSnapshot.id,
        }))
      )
    )
  );

/**
 *
 */
export const writeDoc = ({
  collection,
  id,
  write,
}: WriteDocAction): T.Task<WriteResult> =>
  pipe(
    toCollectionRef(collection).doc(id),
    (docRef) => () =>
      write._type === 'create'
        ? docRef.create(write.data)
        : write._type === 'update'
        ? docRef.update(write.data)
        : docRef.delete()
  );
