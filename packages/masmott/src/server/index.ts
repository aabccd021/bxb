import { initializeApp } from 'firebase-admin/app';
import {
  DocumentData,
  Firestore,
  getFirestore,
  QueryDocumentSnapshot,
  WriteResult,
} from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

import { CollectionSpec, Masmott, SelectVS, Spec, VS } from '../core/schema';

export const makeViewColPath = (collectionName: string, viewName: string) =>
  `${collectionName}_${viewName}`;

export type CreateDoc = (p: {
  readonly collection: string;
  readonly data: DocumentData;
  readonly id: string;
}) => Promise<WriteResult>;

export type ProviderCreateDoc = (firestore: Firestore) => CreateDoc;

export type DBProvider = {
  readonly createDoc: ProviderCreateDoc;
};

export type DB = {
  readonly createDoc: CreateDoc;
};

export const materializeWithSelectVS = (
  data: DocumentData,
  select: SelectVS
): DocumentData =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => Object.keys(select).includes(key))
  );

export const createViewDoc =
  (
    colName: string,
    snapshot: QueryDocumentSnapshot,
    db: { readonly createDoc: CreateDoc }
  ) =>
  ([viewName, viewSpec]: readonly [string, VS]): Promise<WriteResult> =>
    db.createDoc({
      collection: makeViewColPath(colName, viewName),
      data: materializeWithSelectVS(snapshot.data(), viewSpec.select),
      id: snapshot.id,
    });

export const makeDataCreatedTrigger = (
  [colName, colSpec]: readonly [string, CollectionSpec],
  db: { readonly createDoc: CreateDoc }
) =>
  functions.firestore
    .document(`${colName}/{docId}`)
    .onCreate((snapshot) =>
      Promise.allSettled(
        Object.entries(colSpec.view ?? {}).map(
          createViewDoc(colName, snapshot, db)
        )
      )
    );

export const makeKColTriggers =
  (db: { readonly createDoc: CreateDoc }) =>
  (colEntry: readonly [string, CollectionSpec]) => ({
    dataCreated: makeDataCreatedTrigger(colEntry, db),
  });

export const makeKTriggers = (spec: Spec, db: DB) =>
  Object.entries(spec).map(makeKColTriggers(db));

export const makeTriggers = ({
  masmott,
  db,
}: {
  readonly db: { readonly createDoc: CreateDoc };
  readonly masmott: Masmott;
}) => ({
  firestore: {
    k: makeKTriggers(masmott.spec, db),
  },
});

export const makeDb = ({
  firestore,
  provider: { createDoc },
}: {
  readonly firestore: Firestore;
  readonly provider: DBProvider;
}) => ({
  createDoc: createDoc(firestore),
});

export const initAndMakeDb = (provider: DBProvider) =>
  makeDb({ firestore: getFirestore(initializeApp()), provider });

export const initAndMakeTriggers =
  (dbProvider: DBProvider) => (masmott: Masmott) =>
    makeTriggers({
      db: initAndMakeDb(dbProvider),
      masmott,
    });

export const firestoreProvider: DBProvider = {
  createDoc:
    (firestore) =>
    ({ collection, data, id }) =>
      firestore.collection(collection).doc(id).create(data),
};

export const initAndMakeFirestoreTriggers =
  initAndMakeTriggers(firestoreProvider);
