// eslint-disable-next-line no-restricted-imports
import {
  EventContext,
  firestore,
  region,
  SUPPORTED_REGIONS,
} from 'firebase-functions';
import {
  DocumentSnapshot,
  OnCreateTrigger,
  DocumentChangeSnapshot,
  OnUpdateTrigger,
  OnDeleteTrigger,
} from '../type';
import { getDocTrigger, wrapFirebaseSnapshot } from './util';

/**
 * Type safe and convenience firebase-functions wrapper
 */

export function onCreateTrigger(
  collectionName: string,
  handler: (
    snapshot: DocumentSnapshot,
    context: EventContext
  ) => Promise<unknown>
): OnCreateTrigger {
  return getDocTrigger(collectionName).onCreate((snapshot, context) => {
    const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);
    return handler(wrappedSnapshot, context);
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
    return handler(changeSnapshot, context);
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
    return handler(wrappedSnapshot, context);
  });
}
