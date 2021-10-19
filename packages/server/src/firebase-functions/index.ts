// eslint-disable-next-line no-restricted-imports
import {
  OnCreateTrigger,
  OnCreateTriggerHandler,
  OnDeleteTrigger,
  OnDeleteTriggerHandler,
  OnUpdateTrigger,
  OnUpdateTriggerHandler,
} from '../type';
import { wrapFirebaseChangeSnapshot, wrapFirebaseSnapshot } from '../util';
import { getDocTrigger } from './util';

/**
 * Type safe and convenience firebase-functions wrapper
 */

export function onCreateTrigger(
  collectionName: string,
  handler: OnCreateTriggerHandler
): OnCreateTrigger {
  return getDocTrigger(collectionName).onCreate((snapshot, context) => {
    const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
    const result = handler(wrappedSnapshot, context);
    return result;
  });
}

export function onUpdateTrigger(
  collectionName: string,
  handler: OnUpdateTriggerHandler
): OnUpdateTrigger {
  return getDocTrigger(collectionName).onUpdate((change, context) => {
    const wrappedChange = wrapFirebaseChangeSnapshot(change);
    const result = handler(wrappedChange, context);
    return result;
  });
}

export function onDeleteTrigger(
  collectionName: string,
  handler: OnDeleteTriggerHandler
): OnDeleteTrigger {
  return getDocTrigger(collectionName).onDelete((snapshot, context) => {
    const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
    const result = handler(wrappedSnapshot, context);
    return result;
  });
}
