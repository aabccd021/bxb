import { firestore, updateDoc } from '../firebase-admin';
import {
  makeOnCreateTrigger,
  makeOnDeleteTrigger,
} from '../firebase-functions';
import {
  App,
  CountSpec,
  Dict,
  DocumentData,
  OnCreateTrigger,
  OnCreateTriggerHandler,
  OnDeleteTrigger,
} from '../type';
import { getViewCollectionName, Mapped, mapValues } from '../util';
import { makeOnCountedDocDeletedHandler } from './makeOnCountedDocDeletedHandler';

function makeOnCountedDocCreatedTrigger(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countName: string,
  { groupBy: counterRefIdFieldName }: CountSpec
): OnCreateTriggerHandler {
  return async (snapshot): Promise<void> => {
    const counterDocId = snapshot.data[counterRefIdFieldName];
    if (typeof counterDocId !== 'string') {
      throw Error(
        `Invalid Type: ${JSON.stringify({
          data: snapshot.data,
          fieldName: counterRefIdFieldName,
        })}`
      );
    }
    const viewCollectionName = getViewCollectionName(
      counterCollectionName,
      viewName
    );
    const incrementedData = {
      [countName]: firestore.FieldValue.increment(1),
    };
    await updateDoc(app, viewCollectionName, counterDocId, incrementedData);
  };
}

export function onCountedDocCreated<T extends string>(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countSpecs: Mapped<T, CountSpec>
): Mapped<T, OnCreateTrigger> {
  return mapValues(countSpecs, (countSpec, countName) => {
    const handler = makeOnCountedDocCreatedTrigger(
      app,
      counterCollectionName,
      viewName,
      countName,
      countSpec
    );
    const trigger = makeOnCreateTrigger(
      countSpec.countedCollectionName,
      handler
    );
    return trigger;
  });
}

export function onCountedDocDeleted(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countSpecs: Dict<CountSpec>
): Dict<OnDeleteTrigger> {
  return mapValues(countSpecs, (countSpec, countName) => {
    const handler = makeOnCountedDocDeletedHandler(
      app,
      counterCollectionName,
      viewName,
      countName,
      countSpec.groupBy
    );
    const trigger = makeOnDeleteTrigger(
      countSpec.countedCollectionName,
      handler
    );
    return trigger;
  });
}

export function materializeCountViewData(
  countSpecs: Dict<CountSpec>
): DocumentData {
  return mapValues(countSpecs, () => 0);
}
