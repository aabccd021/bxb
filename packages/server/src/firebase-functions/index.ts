// eslint-disable-next-line no-restricted-imports
import { EventContext } from 'firebase-functions';
import {
  DocumentSnapshot,
  OnCreateTrigger,
  DocumentChangeSnapshot,
  OnUpdateTrigger,
  OnDeleteTrigger,
  OnCreateTriggerHandler,
} from '../type';
import { wrapFirebaseSnapshot } from '../util';
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
  handler: (
    change: DocumentChangeSnapshot,
    context: EventContext
  ) => Promise<unknown>
): OnUpdateTrigger {
  return getDocTrigger(collectionName).onUpdate((change, context) => {
    const changeSnapshot = {
      id: change.after.id,
      data: {
        before: change.before.data(),
        after: change.after.data(),
      },
    };
    const result = handler(changeSnapshot, context);
    return result;
  });
}

export function onDeleteTrigger(
  collectionName: string,
  handler: (
    snapshot: DocumentSnapshot,
    context: EventContext
  ) => Promise<unknown>
): OnDeleteTrigger {
  return getDocTrigger(collectionName).onDelete((snapshot, context) => {
    const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
    const result = handler(wrappedSnapshot, context);
    return result;
  });
}
