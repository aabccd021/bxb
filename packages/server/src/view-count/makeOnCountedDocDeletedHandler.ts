import { firestore, updateDoc } from '../firebase-admin';
import { App, OnDeleteTriggerHandler } from '../type';
import { getViewCollectionName } from '../util';

export function makeOnCountedDocDeletedHandler(
  app: App,
  counterCollectionName: string,
  viewName: string,
  countName: string,
  counterRefIdFieldName: string
): OnDeleteTriggerHandler {
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
    const decrementedData = {
      [countName]: firestore.FieldValue.increment(-1),
    };
    await updateDoc(
      app,
      viewCollectionName,
      counterDocId,
      decrementedData
    ).catch((reason) => {
      if (reason.code === firestore.GrpcStatus.NOT_FOUND) {
        // Ignore if counter document not exists.
        return;
      }
      throw reason;
    });
  };
}
