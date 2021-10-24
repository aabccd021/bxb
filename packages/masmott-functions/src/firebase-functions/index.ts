import {
  DocumentBuilder,
  GetDocTriggerOptions,
  OnCreateTrigger,
  OnCreateTriggerHandler,
  OnDeleteTrigger,
  OnDeleteTriggerHandler,
  OnUpdateTrigger,
  OnUpdateTriggerHandler,
} from '../type';
import { wrapFirebaseChangeSnapshot, wrapFirebaseSnapshot } from '../util';
import { getFunctionsFirestore } from './non-testable';

/**
 * Type safe and convenience firebase-functions wrapper
 */

function makeDocTriggerPath(collectionName: string): string {
  return `${collectionName}/{documentId}`;
}

function makeDocTrigger(
  collectionName: string,
  options?: GetDocTriggerOptions
): DocumentBuilder {
  const functionsFirestore = getFunctionsFirestore(options?.regions);
  const docPath = _.makeDocTriggerPath(collectionName);
  const docTrigger = functionsFirestore.document(docPath);
  return docTrigger;
}

export function makeOnCreateTrigger(
  collectionName: string,
  handler: OnCreateTriggerHandler
): OnCreateTrigger {
  return _.makeDocTrigger(collectionName).onCreate((snapshot, context) => {
    const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
    const result = handler(wrappedSnapshot, context);
    return result;
  });
}

export function makeOnUpdateTrigger(
  collectionName: string,
  handler: OnUpdateTriggerHandler
): OnUpdateTrigger {
  return _.makeDocTrigger(collectionName).onUpdate((change, context) => {
    const wrappedChange = wrapFirebaseChangeSnapshot(change);
    const result = handler(wrappedChange, context);
    return result;
  });
}

export function makeOnDeleteTrigger(
  collectionName: string,
  handler: OnDeleteTriggerHandler
): OnDeleteTrigger {
  return _.makeDocTrigger(collectionName).onDelete((snapshot, context) => {
    const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
    const result = handler(wrappedSnapshot, context);
    return result;
  });
}

export const _ = { makeDocTrigger, makeDocTriggerPath };
