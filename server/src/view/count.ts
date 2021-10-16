import { mapValues } from 'lodash';
import { CountSpec, Dict, DocumentData } from '..';
import { getViewCollectionName } from '../util';
import { App, FieldValue, updateDoc } from '../wrapper/firebase-admin';
import {
  OnCreateTrigger,
  onCreateTrigger,
  onDeleteTrigger,
  OnDeleteTrigger,
} from '../wrapper/firebase-functions';

function makeOnCountedDocCreatedTrigger(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countName: string,
  { groupBy: counterRefIdFieldName, countedCollectionName }: CountSpec
): OnCreateTrigger {
  return onCreateTrigger(countedCollectionName, async (snapshot) => {
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
    updateDoc(app, viewCollectionName, counterDocId, {
      [countName]: FieldValue.increment(1),
    });
  });
}

export function onCountedDocCreated(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countSpecs: Dict<CountSpec>
): Dict<OnCreateTrigger> {
  return mapValues(countSpecs, (countSpec, countName) =>
    makeOnCountedDocCreatedTrigger(
      app,
      counterCollectionName,
      viewName,
      countName,
      countSpec
    )
  );
}

function makeOnCountedDocDeletedTrigger(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countName: string,
  { groupBy: counterRefIdFieldName, countedCollectionName }: CountSpec
): OnDeleteTrigger {
  return onDeleteTrigger(countedCollectionName, async (snapshot) => {
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
    updateDoc(app, viewCollectionName, counterDocId, {
      [countName]: FieldValue.increment(-1),
    });
  });
}

export function onCountedDocDeleted(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countSpecs: Dict<CountSpec>
): Dict<OnDeleteTrigger> {
  return mapValues(countSpecs, (countSpec, countName) =>
    makeOnCountedDocDeletedTrigger(
      app,
      counterCollectionName,
      viewName,
      countName,
      countSpec
    )
  );
}

export function materializeCountViewData(
  countSpecs: Dict<CountSpec>
): DocumentData {
  return mapValues(countSpecs, () => 0);
}
