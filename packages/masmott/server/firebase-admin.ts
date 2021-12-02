/* eslint-disable no-restricted-imports */
import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  getFirestore,
  GrpcStatus,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import * as A from 'fp-ts/lib/ReadonlyArray';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import { DocumentData, DocumentSnapshot } from '../src';
import { CollectionQuery, FirestoreDocumentSnapshot, Query, WriteDocumentData } from './types';
import { wrapFirebaseSnapshot } from './util';

export const firestore = { FieldValue, GrpcStatus };

const makeCollectionRef = (collectionName: string): CollectionReference =>
  getFirestore().collection(collectionName);

const makeDocRef = (collectionName: string, documentId: string): DocumentReference =>
  makeCollectionRef(collectionName).doc(documentId);

const makeQueryFromCollectionRef =
  (query: O.Option<Query>) =>
  (collectionRef: CollectionReference): CollectionQuery =>
    pipe(
      query,
      O.foldW(
        () => collectionRef,
        (queryValue) => queryValue(collectionRef)
      )
    );

const getDocument = (collectionQuery: CollectionQuery): T.Task<QuerySnapshot> =>
  collectionQuery.get;

const getSnapshotDocs = (snapshot: QuerySnapshot): readonly FirestoreDocumentSnapshot[] =>
  snapshot.docs;

export async function getDoc(
  collectionName: string,
  documentId: string
): Promise<DocumentSnapshot> {
  const snapshot = await makeDocRef(collectionName, documentId).get();
  const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
  return wrappedSnapshot;
}

export function deleteDoc(
  collectionName: string,
  documentId: string
): Promise<FirebaseFirestore.WriteResult> {
  return makeDocRef(collectionName, documentId).delete();
}

export function createDoc(
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return makeDocRef(collectionName, documentId).create(data);
}

export function updateDoc(
  collectionName: string,
  documentId: string,
  data: WriteDocumentData
): Promise<FirebaseFirestore.WriteResult> {
  return makeDocRef(collectionName, documentId).update(data);
}

export const getCollection = (
  collectionName: string,
  query: O.Option<Query>
): T.Task<readonly DocumentSnapshot[]> =>
  pipe(
    collectionName,
    makeCollectionRef,
    makeQueryFromCollectionRef(query),
    getDocument,
    T.map(flow(getSnapshotDocs, A.map(wrapFirebaseSnapshot)))
  );

// export const _ = { getDocRef };
