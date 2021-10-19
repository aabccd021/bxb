import {
  App,
  CountSpec,
  Dict,
  DocumentData,
  OnCreateTrigger,
  OnDeleteTrigger,
} from '../type';
import { FieldValue, GrpcStatus, updateDoc } from '../firebase-admin';
import { onCreateTrigger, onDeleteTrigger } from '../firebase-functions';
import { getViewCollectionName, Mapped, mapValues } from '../util';

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
    const incrementedData = {
      [countName]: FieldValue.increment(1),
    };
    await updateDoc(app, viewCollectionName, counterDocId, incrementedData);
  });
}

export function onCountedDocCreated<T extends string>(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countSpecs: Mapped<T, CountSpec>
): Mapped<T, OnCreateTrigger> {
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
    const decrementedData = {
      [countName]: FieldValue.increment(-1),
    };
    await updateDoc(
      app,
      viewCollectionName,
      counterDocId,
      decrementedData
    ).catch((reason) => {
      if (reason.code === GrpcStatus.NOT_FOUND) {
        // Ignore if counter document not exists.
        return;
      }
      throw reason;
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
