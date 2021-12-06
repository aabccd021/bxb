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
const makeDocTriggerPath = (collection: string) => `${collection}/{docId}`;

/**
 *
 */
const makeDocTrigger = (collection: string, options?: GetDocTriggerOptions) =>
  pipe(
    collection,
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
    pipe(change, wrapChange, handler(context))();

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
    pipe(snapshot, wrapSnapshot, handler(context))();

/**
 *
 */
export const makeOnCreateTrigger = (
  collection: string,
  handler: SnapshotHandler
) => makeDocTrigger(collection).onCreate(wrapSnapshotHandler(handler));

/**
 *
 */
export const makeOnUpdateTrigger =
  (collection: string) => (handler: ChangeHandler) =>
    makeDocTrigger(collection).onUpdate(wrapChangeHandler(handler));

/**
 *
 */
export const makeDeleteTrigger =
  (collection: string) => (handler: SnapshotHandler) =>
    makeDocTrigger(collection).onCreate(wrapSnapshotHandler(handler));
