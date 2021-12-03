import { pipe } from 'fp-ts/lib/function';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import lodashMapValues from 'lodash/mapValues';
import { Dict, DocumentSnapshot, Mapped } from '../src';
import {
  Change,
  DocumentChangeSnapshot,
  DocumentData,
  DocumentDataChange,
  EventContext,
  FirestoreDataType,
  FirestoreDocumentSnapshot,
  OnCreateTriggerHandler,
  OnUpdateTriggerHandler,
  QueryDocumentSnapshot,
} from './types';

export function mapValues<T extends string | number, V, VResult>(
  obj: Mapped<T, V>,
  mapper: (value: V, key: string) => VResult
): Mapped<T, VResult> {
  return lodashMapValues(obj, mapper);
}

/**
 * Throw rejected promises from array of settled promises.
 *
 * @param promiseResults The array of settled promises to process
 */
export function throwRejectedPromises(
  promiseResults: readonly PromiseSettledResult<unknown>[]
  // eslint-disable-next-line functional/no-return-void
): void {
  const rejectedPromiseReasons = promiseResults.map((result) =>
    result.status === 'rejected' ? result.reason : undefined
  );

  const errors = compact(rejectedPromiseReasons);

  if (!isEmpty(errors)) {
    throw Error(JSON.stringify(errors));
  }
}

/**
 * Create a object by merging array of objects.
 *
 * @param objectArray The array of object to merge.
 * @returns The merged object
 */
export function mergeObjectArray<T>(objectArray: readonly { readonly [key: string]: T }[]): {
  readonly [key: string]: T;
} {
  return objectArray.reduce((acc, object) => ({ ...acc, ...object }), {});
}

/**
 * Create an object with all undefined values removed.
 *
 * @example
 * const obejectWithUndefined = {
 *   definedValue: '',
 *   undefinedValue: undefined
 *  }
 * const result = compactObject(objectWithUndefined)
 * // result => { definedValue: '' }
 *
 *
 * @param object The object to compact.
 * @returns Returns the new object without undefined values.
 */
export function compactObject<T>(object: Dict<T | undefined>): Dict<T> {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      return {
        ...acc,
        [key]: value,
      };
    }
    return acc;
  }, {});
}

export const toViewCollectionPathWithViewName =
  (viewName: string) =>
  (collectionName: string): string =>
    `${collectionName}_${viewName}`;

export const wrapFirebaseSnapshot = (snapshot: FirestoreDocumentSnapshot): DocumentSnapshot => ({
  id: snapshot.id,
  data: snapshot.data() ?? {},
});

export const wrapSnapshotTriggerHandler =
  (handler: OnCreateTriggerHandler) =>
  (snapshot: FirestoreDocumentSnapshot, context: EventContext): Promise<unknown> =>
    pipe(snapshot, wrapFirebaseSnapshot, handler(context))();

export const wrapFirebaseChangeSnapshot = (
  change: Change<QueryDocumentSnapshot>
): DocumentChangeSnapshot => ({
  id: change.after.id,
  data: {
    before: change.before.data(),
    after: change.after.data(),
  },
});

export const wrapChangeTriggerHandler =
  (handler: OnUpdateTriggerHandler) =>
  (change: Change<QueryDocumentSnapshot>, context: EventContext): Promise<unknown> =>
    pipe(change, wrapFirebaseChangeSnapshot, handler(context))();

export const makeDocTriggerPath = (collectionName: string): string =>
  `${collectionName}/{documentId}`;
