import {
  DeleteDocAction,
  DocSnapshot,
  GetDocsAction,
  Query,
  WhereQuerySpec,
  WhereQuerySpecs,
} from '@server/type';
import {
  CollectionReference,
  DocumentSnapshot as FirestoreDocumentSnapshot,
  getFirestore,
} from 'firebase-admin/firestore';
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';

/**
 *
 */
type Queryable = FirebaseFirestore.Query | CollectionReference;

/**
 *
 */
const makeDocRef = (documentId: string) => (collectionName: string) =>
  toCollectionRef(collectionName).doc(documentId);

/**
 *
 */
const toCollectionRef = (collectionName: string) =>
  getFirestore().collection(collectionName);

/**
 *
 */
const wrapFirebaseSnapshot = (
  snapshot: FirestoreDocumentSnapshot
): DocSnapshot => ({
  id: snapshot.id,
  data: snapshot.data() ?? {},
});

/**
 *
 */
const getDocumentsFromQueryable = (
  query: Queryable
): T.Task<FirebaseFirestore.QuerySnapshot> => query.get;

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
      O.fromNullable(nullableWhereSpecs),
      O.map(handleWhereSpec(colletionRef)),
      O.getOrElseW(() => colletionRef)
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
export const deleteDoc = (
  action: DeleteDocAction
): T.Task<FirebaseFirestore.WriteResult> =>
  makeDocRef(action.id)(action.collection).delete;
