import { CountSpec, Dict, Mapped } from '../src';
import { firestore, updateDoc } from './firebase-admin';
import { makeOnCreateTrigger, makeOnDeleteTrigger } from './firebase-functions';
import {
  DocumentData,
  OnCreateTrigger,
  OnCreateTriggerHandler,
  OnDeleteTrigger,
  OnDeleteTriggerHandler,
  WriteDocumentData
} from './types';
import { getViewCollectionName, mapValues } from './util';

function getStringField(data: DocumentData, fieldName: string): string {
  const fieldValue = data[fieldName];
  if (typeof fieldValue !== 'string') {
    throw Error(`Invalid Type: ${JSON.stringify({ data, fieldName })}`);
  }
  return fieldValue;
}

function makeIncrementDocData(countName: string, value: 1 | -1): WriteDocumentData {
  return {
    [countName]: firestore.FieldValue.increment(value),
  };
}

function makeOnCountedDocCreatedTrigger(
  counterCollectionName: string,
  viewName: string,
  countName: string,
  { groupBy: counterRefIdFieldName }: CountSpec
): OnCreateTriggerHandler {
  return async (snapshot): Promise<void> => {
    const counterDocId = _.getStringField(snapshot.data, counterRefIdFieldName);
    const viewCollectionName = getViewCollectionName(counterCollectionName, viewName);
    const incrementedData = _.makeIncrementDocData(countName, 1);
    await updateDoc(viewCollectionName, counterDocId, incrementedData);
  };
}

export function onCountedDocCreated<T extends string>(
  counterCollectionName: string,
  viewName: string,
  countSpecs: Mapped<T, CountSpec>
): Mapped<T, OnCreateTrigger> {
  return mapValues(countSpecs, (countSpec, countName) => {
    const handler = makeOnCountedDocCreatedTrigger(
      counterCollectionName,
      viewName,
      countName,
      countSpec
    );
    const trigger = makeOnCreateTrigger(countSpec.countedCollectionName, handler);
    return trigger;
  });
}

function makeOnCountedDocDeletedHandler(
  counterCollectionName: string,
  viewName: string,
  countName: string,
  counterRefIdFieldName: string
): OnDeleteTriggerHandler {
  return async (snapshot): Promise<void> => {
    const counterDocId = _.getStringField(snapshot.data, counterRefIdFieldName);
    const viewCollectionName = getViewCollectionName(counterCollectionName, viewName);
    const decrementedData = _.makeIncrementDocData(countName, -1);
    await updateDoc(viewCollectionName, counterDocId, decrementedData).catch((reason) => {
      if (reason.code === firestore.GrpcStatus.NOT_FOUND) {
        // Ignore if counter document not exists.
        return;
      }
      throw reason;
    });
  };
}

export function onCountedDocDeleted(
  counterCollectionName: string,
  viewName: string,
  countSpecs: Dict<CountSpec>
): Dict<OnDeleteTrigger> {
  return mapValues(countSpecs, (countSpec, countName) => {
    const handler = _.makeOnCountedDocDeletedHandler(
      counterCollectionName,
      viewName,
      countName,
      countSpec.groupBy
    );
    const trigger = makeOnDeleteTrigger(countSpec.countedCollectionName, handler);
    return trigger;
  });
}

export function materializeCountViewData(countSpecs: Dict<CountSpec>): DocumentData {
  return mapValues(countSpecs, () => 0);
}

export const _ = {
  makeOnCountedDocDeletedHandler,
  makeOnCountedDocCreatedTrigger,
  makeIncrementDocData,
  getStringField,
};