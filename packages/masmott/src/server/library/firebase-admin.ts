import {
  CreateDocAction,
  DeleteDocAction,
  GetDocsAction,
  UpdateDocAction,
  WhereQuerySpec,
  WriteResult,
} from '@server/type';
import { CollectionReference, getFirestore } from 'firebase-admin/firestore';
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

type Queryable = FirebaseFirestore.Query | CollectionReference;

/**
 *
 */
const toCollectionRef = (collection: string) =>
  getFirestore().collection(collection);

/**
 *
 */
const toDocRef = ({
  collection,
  id,
}: {
  readonly collection: string;
  readonly id: string;
}) => toCollectionRef(collection).doc(id);

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

export type GetDocs = typeof getDocs;

export const createDoc = ({
  collection,
  id,
  data,
}: CreateDocAction): TE.TaskEither<unknown, WriteResult> =>
  TE.tryCatch(
    () => toDocRef({ collection, id }).create(data),
    (reason) => reason
  );

export type CreateDoc = typeof createDoc;

export const updateDoc = ({
  collection,
  id,
  data,
}: UpdateDocAction): TE.TaskEither<unknown, WriteResult> =>
  TE.tryCatch(
    () => toDocRef({ collection, id }).update(data),
    (reason) => reason
  );

export type UpdateDoc = typeof updateDoc;

export const deleteDoc = ({
  collection,
  id,
}: DeleteDocAction): TE.TaskEither<unknown, WriteResult> =>
  TE.tryCatch(
    () => toDocRef({ collection, id }).delete(),
    (reason) => reason
  );

export type DeleteDoc = typeof deleteDoc;
