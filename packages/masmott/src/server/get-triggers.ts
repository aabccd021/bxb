import { CollectionSpec, Masmott, Spec, VS } from '@src/core/schema';
import { initializeApp } from 'firebase-admin/app';
import {
  DocumentData,
  Firestore,
  getFirestore,
  WriteResult
} from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

export const makeViewColPath = (collectionName: string, viewName: string) =>
  `${collectionName}_${viewName}`;

export type CreateDoc = (p: {
  readonly collection: string;
  readonly data: DocumentData;
  readonly id: string;
}) => Promise<WriteResult>;

export type _CreateDoc = (firestore: Firestore) => CreateDoc;

export type _DocEff = {
  readonly create: _CreateDoc;
};

export type DocEff = {
  readonly create: CreateDoc;
};

export const materializeViewDoc =
  (colName: string, snapshotId: string, docEff: DocEff) =>
  ([viewName, _viewSpec]: readonly [string, VS]) => {
    const viewColPath = makeViewColPath(colName, viewName);
    const viewDoc = {};
    const createResult = docEff.create({
      collection: viewColPath,
      data: viewDoc,
      id: snapshotId,
    });
    return createResult;
  };

export const makeKDataCreatedTrigger = (
  [colName, colSpec]: readonly [string, CollectionSpec],
  docEff: DocEff
) =>
  functions.firestore.document(`${colName}/{docId}`).onCreate((snapshot) => {
    const viewDocCreationPromises = Object.entries(colSpec.view ?? {}).map(
      materializeViewDoc(colName, snapshot.id, docEff)
    );
    return Promise.allSettled(viewDocCreationPromises);
  });

export const makeKColTriggers =
  (docEff: DocEff) => (colEntry: readonly [string, CollectionSpec]) => ({
    dataCreated: makeKDataCreatedTrigger(colEntry, docEff),
  });

export const makeKTriggers = (spec: Spec, docEff: DocEff) =>
  Object.entries(spec).map(makeKColTriggers(docEff));

export const _makeTriggers = (_docEff: _DocEff) => (masmott: Masmott) => {
  const app = initializeApp();
  const firestore = getFirestore(app);
  const docEff: DocEff = {
    create: _docEff.create(firestore),
  };
  return {
    firestore: {
      k: makeKTriggers(masmott.spec, docEff),
    },
  };
};

export const docEff: _DocEff = {
  create:
    (firestore) =>
    ({ collection: collectionPath, data, id: docId }) =>
      firestore.collection(collectionPath).doc(docId).create(data),
};

export const makeTriggers = _makeTriggers(docEff);
