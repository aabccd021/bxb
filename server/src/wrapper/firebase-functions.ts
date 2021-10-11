// eslint-disable-next-line no-restricted-imports
import {
  Change,
  CloudFunction,
  EventContext,
  firestore,
} from 'firebase-functions';
import { Dictionary } from 'lodash';
import { DocumentChangeSnapshot, DocumentSnapshot } from '../type';

/**
 * Type safe and convenience firebase-functions wrapper
 */

export type OnCreateTrigger = CloudFunction<firestore.QueryDocumentSnapshot>;

export type OnDeleteTrigger = OnCreateTrigger;

export type OnUpdateTrigger = CloudFunction<
  Change<firestore.QueryDocumentSnapshot>
>;

export type ViewTriggers = {
  readonly onSrcDocCreated: OnCreateTrigger;
  readonly onSrcDocUpdated: OnUpdateTrigger;
  readonly onSrcDocDeleted: OnDeleteTrigger;
  readonly onJoinRefDocUpdated: Dictionary<OnUpdateTrigger>;
};

export type CollectionTriggers = {
  readonly onRefDocDeleted: Dictionary<OnDeleteTrigger | undefined>;
  readonly view: Dictionary<ViewTriggers>;
};

function getDocTrigger(collectionName: string): firestore.DocumentBuilder {
  return firestore.document(`${collectionName}/{documentId}`);
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
