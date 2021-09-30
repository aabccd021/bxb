// eslint-disable-next-line no-restricted-imports
import {
  Change,
  CloudFunction,
  EventContext,
  firestore,
} from 'firebase-functions';
import { DocumentData } from './type';

/**
 * Type safe firebase-functions wrapper
 */

export type DocumentDataChange = {
  readonly before: DocumentData;
  readonly after: DocumentData;
};

export type ChangeSnapshot = {
  readonly id: string;
  readonly data: DocumentDataChange;
};

export type DocFunction = firestore.DocumentBuilder;

export type OnCreateTrigger = CloudFunction<firestore.QueryDocumentSnapshot>;

export type OnDeleteTrigger = OnCreateTrigger;

export type OnUpdateTrigger = CloudFunction<
  Change<firestore.QueryDocumentSnapshot>
>;

function getDocFunction(collectionName: string): firestore.DocumentBuilder {
  return firestore.document(`${collectionName}/{docId}`);
}

export function onCreate(
  collectionName: string,
  handler: (
    snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>,
    context: EventContext
  ) => Promise<unknown>
): CloudFunction<firestore.QueryDocumentSnapshot> {
  return getDocFunction(collectionName).onCreate(handler);
}

export function onUpdate(
  collectionName: string,
  handler: (change: ChangeSnapshot, context: EventContext) => Promise<unknown>
): CloudFunction<Change<firestore.QueryDocumentSnapshot>> {
  return getDocFunction(collectionName).onUpdate((change, context) => {
    change.after;
    return handler(
      {
        id: change.after.id,
        data: {
          before: change.before.data(),
          after: change.after.data(),
        },
      },
      context
    );
  });
}

export function onDelete(
  collectionName: string,
  handler: (
    snapshot: FirebaseFirestore.QueryDocumentSnapshot<DocumentData>,
    context: EventContext
  ) => Promise<unknown>
): CloudFunction<firestore.QueryDocumentSnapshot> {
  return getDocFunction(collectionName).onDelete(handler);
}
