import {
  Change,
  firestore,
  logger,
  region,
  SUPPORTED_REGIONS,
} from 'firebase-functions';
import {
  DocumentSnapshot as FunctionDocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase-functions/v1/firestore';
import { pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';

import {
  ChangeHanlder as ChangeHandler,
  DocSnapshot,
  DocumentChangeSnapshot,
  LogAction,
  SnapshotTrigger,
  SnapshotTriggerHandler,
} from '../type';

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
  (change: Change<QueryDocumentSnapshot>): Promise<unknown> =>
    handler({ change: wrapChange(change) })();

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
  (handler: SnapshotTrigger) =>
  (snapshot: FunctionDocumentSnapshot): Promise<unknown> =>
    pipe(snapshot, wrapSnapshot, handler)();

/**
 *
 */
export const makeOnCreateTrigger =
  (collection: string) => (handler: SnapshotTriggerHandler<'create'>) =>
    pipe(
      { collection, triggerType: 'create' },
      handler,
      wrapSnapshotHandler,
      makeDocTrigger(collection).onDelete
    );

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
  (collection: string) => (handler: SnapshotTriggerHandler<'delete'>) =>
    pipe(
      { collection, triggerType: 'delete' },
      handler,
      wrapSnapshotHandler,
      makeDocTrigger(collection).onDelete
    );

/**
 *
 */
export const log =
  ({ jsonPayload, message, severity }: LogAction): IO.IO<void> =>
  () =>
    logger.write({ ...jsonPayload, message, severity });

export type Log = typeof log;