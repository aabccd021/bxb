import {
  ChangeHanlder as ChangeHandler,
  DocSnapshot,
  DocumentChangeSnapshot,
  SnapshotHandler,
} from '@server/type';
import {
  Change,
  EventContext,
  firestore,
  region,
  SUPPORTED_REGIONS,
} from 'firebase-functions';
import {
  DocumentSnapshot as FunctionDocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase-functions/v1/firestore';
import { pipe } from 'fp-ts/function';

/**
 *
 */
type GetDocTriggerOptions = {
  readonly regions?: ReadonlyArray<typeof SUPPORTED_REGIONS[number]>;
};

/**
 *
 */
const getFunctionsFirestore = (
  regions?: ReadonlyArray<typeof SUPPORTED_REGIONS[number]>
) => (regions !== undefined ? region(...regions).firestore : firestore);

/**
 *
 */
const makeDocTriggerPath = (collectionName: string) =>
  `${collectionName}/{documentId}`;

/**
 *
 */
const makeDocTrigger = (
  collectionName: string,
  options?: GetDocTriggerOptions
) =>
  pipe(
    collectionName,
    makeDocTriggerPath,
    getFunctionsFirestore(options?.regions).document
  );

/**
 *
 */
const wrapChange = (
  change: Change<QueryDocumentSnapshot>
): DocumentChangeSnapshot => ({
  data: {
    after: change.after.data(),
    before: change.before.data(),
  },
  id: change.after.id,
});

/**
 *
 */
const wrapChangeHandler =
  (handler: ChangeHandler) =>
  (
    change: Change<QueryDocumentSnapshot>,
    context: EventContext
  ): Promise<unknown> =>
    handler(wrapChange(change), context)();

/**
 *
 */
const wrapSnapshot = (snapshot: FunctionDocumentSnapshot): DocSnapshot => ({
  data: snapshot.data() ?? {},
  id: snapshot.id,
});

/**
 *
 */
const wrapSnapshotHandler =
  (handler: SnapshotHandler) =>
  (
    snapshot: FunctionDocumentSnapshot,
    context: EventContext
  ): Promise<unknown> =>
    handler(wrapSnapshot(snapshot), context)();

/**
 *
 */
export const makeOnCreateTrigger = (
  collectionName: string,
  handler: SnapshotHandler
) => makeDocTrigger(collectionName).onCreate(wrapSnapshotHandler(handler));

/**
 *
 */
export const makeOnUpdateTrigger =
  (collectionName: string) => (handler: ChangeHandler) =>
    makeDocTrigger(collectionName).onUpdate(wrapChangeHandler(handler));

/**
 *
 */
export const makeDeleteTrigger =
  (collectionName: string) => (handler: SnapshotHandler) =>
    makeDocTrigger(collectionName).onCreate(wrapSnapshotHandler(handler));
