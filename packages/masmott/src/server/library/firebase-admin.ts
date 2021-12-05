import {
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
import { map as A_map, reduce } from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';

type Queryable = FirebaseFirestore.Query | CollectionReference;

/**
 *
 */
const toCollectionRef = (collectionName: string) =>
  getFirestore().collection(collectionName);

/**
 *
 */
const makeDocRef = (documentId: string) => (collectionName: string) =>
  toCollectionRef(collectionName).doc(documentId);

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
  A_map(wrapFirebaseSnapshot)
);

/**
 *
 */
const handleWhereSpec =
  (collectionRef: CollectionReference) => (whereSpecs: WhereQuerySpecs) =>
    pipe(
      whereSpecs,
      reduce<WhereQuerySpec, Queryable>(
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
  (action: DeleteDocAction): T.Task<WriteResult> =>
  () =>
    makeDocRef(action.id)(action.collection).delete();
