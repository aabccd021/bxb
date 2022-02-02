import { initializeApp } from 'firebase-admin/app';
import {
  DocumentData,
  Firestore,
  getFirestore,
  QueryDocumentSnapshot,
  WriteResult,
} from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { https, HttpsFunction } from 'firebase-functions';
import next, { NextConfig } from 'next';

import { CollectionSpec, Masmott, SelectVS, Spec, VS } from '../core/schema';

const makeViewColPath = (collectionName: string, viewName: string) =>
  `${collectionName}_${viewName}`;

type CreateDoc = (p: {
  readonly collection: string;
  readonly data: DocumentData;
  readonly id: string;
}) => Promise<WriteResult>;

type ProviderCreateDoc = (firestore: Firestore) => CreateDoc;

type DBProvider = {
  readonly createDoc: ProviderCreateDoc;
};

type DB = {
  readonly createDoc: CreateDoc;
};

const materializeWithSelectVS = (data: DocumentData, select: SelectVS): DocumentData =>
  Object.fromEntries(Object.entries(data).filter(([key]) => Object.keys(select).includes(key)));

const createViewDoc =
  (colName: string, snapshot: QueryDocumentSnapshot, db: { readonly createDoc: CreateDoc }) =>
  ([viewName, viewSpec]: readonly [string, VS]): Promise<WriteResult> =>
    db.createDoc({
      collection: makeViewColPath(colName, viewName),
      data: materializeWithSelectVS(snapshot.data(), viewSpec.select),
      id: snapshot.id,
    });

const makeDataCreatedTrigger = (
  [colName, colSpec]: readonly [string, CollectionSpec],
  db: { readonly createDoc: CreateDoc }
) =>
  functions.firestore
    .document(`${colName}/{docId}`)
    .onCreate((snapshot) =>
      Promise.allSettled(
        Object.entries(colSpec.view ?? {}).map(createViewDoc(colName, snapshot, db))
      )
    );

const makeKColTriggers =
  (db: { readonly createDoc: CreateDoc }) => (colEntry: readonly [string, CollectionSpec]) => ({
    dataCreated: makeDataCreatedTrigger(colEntry, db),
  });

const makeKTriggers = (spec: Spec, db: DB) => Object.entries(spec).map(makeKColTriggers(db));

function makeNextjsFunction(conf: NextConfig): HttpsFunction {
  const nextjsServer = next({ conf, dev: false });

  const nextjsHandle = nextjsServer.getRequestHandler();

  const nextjsFunc = https.onRequest((request, response) =>
    nextjsServer.prepare().then(() => nextjsHandle(request, response))
  );

  return nextjsFunc;
}

const makeTriggers = ({
  masmott,
  db,
  nextConfig: conf,
}: {
  readonly db: { readonly createDoc: CreateDoc };
  readonly masmott: Masmott;
  readonly nextConfig: NextConfig;
}) => ({
  firestore: {
    k: makeKTriggers(masmott.spec, db),
  },
  nextjs: makeNextjsFunction(conf),
});

const makeDb = ({
  firestore,
  provider: { createDoc },
}: {
  readonly firestore: Firestore;
  readonly provider: DBProvider;
}) => ({
  createDoc: createDoc(firestore),
});

const initAndMakeDb = (provider: DBProvider) =>
  makeDb({ firestore: getFirestore(initializeApp()), provider });

export const initAndMakeTriggers =
  (dbProvider: DBProvider) => (masmott: Masmott, nextConfig: NextConfig) =>
    makeTriggers({
      db: initAndMakeDb(dbProvider),
      masmott,
      nextConfig,
    });

export const firestoreProvider: DBProvider = {
  createDoc:
    (firestore) =>
    ({ collection, data, id }) =>
      firestore.collection(collection).doc(id).create(data),
};

export const initAndMakeFirestoreTriggers = initAndMakeTriggers(firestoreProvider);
