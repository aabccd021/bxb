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

/**
 * Type safe and convenience firebase-functions wrapper
 */

function getDocTrigger(
  collectionName: string,
  options?: {
    readonly regions?: ReadonlyArray<typeof SUPPORTED_REGIONS[number] | string>;
  }
): firestore.DocumentBuilder {
  const functionWithRegion =
    options?.regions !== undefined
      ? region(...options.regions).firestore
      : firestore;
  return functionWithRegion.document(`${collectionName}/{documentId}`);
}

export function wrapFirebaseSnapshot(
  snapshot: firestore.QueryDocumentSnapshot
): DocumentSnapshot {
  return {
    id: snapshot.id,
    data: snapshot.data(),
  };
}

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
