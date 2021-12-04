import { CollectionReference, getFirestore } from 'firebase-admin/firestore';
import { flow, pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/ReadonlyArray';
import * as T from 'fp-ts/lib/Task';
import {
  DocumentSnapshot,
  FirestoreDocumentSnapshot,
  Query,
  WhereQuerySpec,
  WhereQuerySpecs,
} from '../types';
import * as O from 'fp-ts/lib/Option';
import { where } from '@firebase/firestore/dist/lite';

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
): DocumentSnapshot => ({
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
const queryToRef = (query: Query): Queryable =>
  pipe(query.collection, toCollectionRef, toCollectionQuery(query.where));
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
export const deleteDocWithCollection =
  (collection: string) =>
  (documentId: string): T.Task<FirebaseFirestore.WriteResult> =>
    deleteDocWithId(documentId)(collection);

/**
 *
 */
export const deleteDocWithId =
  (documentId: string) =>
  (collection: string): T.Task<FirebaseFirestore.WriteResult> =>
    makeDocRef(documentId)(collection).delete;
