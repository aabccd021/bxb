import {
  CreateDocAction,
  DeleteDocAction,
  DocSnapshot,
  GetDocsAction,
  WhereQuerySpec,
  WhereQuerySpecs,
  WriteResult,
} from '@server/type';
import {
  CollectionReference,
  DocumentSnapshot as FirestoreDocumentSnapshot,
  getFirestore,
} from 'firebase-admin/firestore';
import { flow, pipe } from 'fp-ts/function';
import { fromNullable, getOrElseW, map } from 'fp-ts/Option';
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
const makeDocRef = (collection: string) => (documentId: string) =>
  toCollectionRef(collection).doc(documentId);

/**
 *
 */
const wrapFirebaseSnapshot = (
  snapshot: FirestoreDocumentSnapshot
): DocSnapshot => ({
  data: snapshot.data() ?? {},
  id: snapshot.id,
});

/**
 *
 */
const getDocumentsFromQueryable =
  (query: Queryable): T.Task<FirebaseFirestore.QuerySnapshot> =>
  () =>
    query.get();

/**
 *
 */
const wrapDocs = flow(
  (querySnapshot: FirebaseFirestore.QuerySnapshot) => querySnapshot.docs,
  A.map(wrapFirebaseSnapshot)
);

/**
 *
 */
const handleWhereSpec =
  (collectionRef: CollectionReference) => (whereSpecs: WhereQuerySpecs) =>
    pipe(
      whereSpecs,
      A.reduce<WhereQuerySpec, Queryable>(
        collectionRef,
        (collectionQueryAcc, whereSpec) =>
          collectionQueryAcc.where(whereSpec[0], whereSpec[1], whereSpec[2])
      )
    );

/**
 *
 */
const toCollectionQuery =
  (nullableWhereSpecs: WhereQuerySpecs | undefined) =>
  (colletionRef: CollectionReference) =>
    pipe(
      fromNullable(nullableWhereSpecs),
      map(handleWhereSpec(colletionRef)),
      getOrElseW(() => colletionRef)
    );

/**
 *
 */
const queryToRef = (action: GetDocsAction): Queryable =>
  pipe(action.collection, toCollectionRef, toCollectionQuery(action.where));

/**
 *
 */
export const getDocuments = flow(
  queryToRef,
  getDocumentsFromQueryable,
  T.map(wrapDocs)
);

/**
 *
 */
export const deleteDoc =
  ({ collection, id }: DeleteDocAction): T.Task<WriteResult> =>
  () =>
    makeDocRef(collection)(id).delete();

/**
 *
 */
export const createDoc =
  ({ collection, id, data }: CreateDocAction): T.Task<WriteResult> =>
  () =>
    makeDocRef(collection)(id).create(data);
