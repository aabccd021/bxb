import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import lodashMapValues from 'lodash/mapValues';
import { Dict, DocumentSnapshot, Mapped } from '../src';
import {
  Change,
  DocumentChangeSnapshot,
  DocumentData,
  DocumentDataChange,
  FirestoreDataType,
  FirestoreDocumentSnapshot,
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

/**
 * Get value difference before and after a change.
 * Returns undefined if value not changed.
 *
 * @example
 * const change1 = getValueChange('foo', 'bar')
 * // change1 => 'bar'
 *
 * @example
 * const change2 = getValueChange('lorem', 'lorem')
 * // change2 => undefined
 *
 * @param beforeValue Value before change.
 * @param afterValue Value after change.
 * @returns Difference between before and after.
 */
export function getValueChange(
  beforeValue: FirestoreDataType,
  afterValue: FirestoreDataType
): FirestoreDataType | undefined {
  if (typeof beforeValue === 'string' && typeof afterValue === 'string') {
    if (beforeValue !== afterValue) {
      return afterValue;
    }
    return undefined;
  }
  throw Error(JSON.stringify({ beforeValue, afterValue }));
}

/**
 *
 * @param documentDataChange
 * @returns
 */
export function getDocDataChange({ before, after }: DocumentDataChange): DocumentData {
  const docDataDiff = mapValues(before, (beforeFieldData, fieldName) => {
    const afterFieldData = after[fieldName];

    // undefined (optional) field is not supported
    if (afterFieldData === undefined) {
      throw Error(JSON.stringify({ before, afterFieldData, fieldName }));
    }

    const fieldDiff = getValueChange(beforeFieldData, afterFieldData);
    return fieldDiff;
  });

  const compactDocDataDiff = compactObject(docDataDiff);

  return compactDocDataDiff;
}

export function getViewCollectionName(collectionName: string, viewName: string): string {
  return `${collectionName}_${viewName}`;
}

export function wrapFirebaseSnapshot(snapshot: FirestoreDocumentSnapshot): DocumentSnapshot {
  return {
    id: snapshot.id,
    data: snapshot.data() ?? {},
  };
}

export function wrapFirebaseChangeSnapshot(
  change: Change<QueryDocumentSnapshot>
): DocumentChangeSnapshot {
  return {
    id: change.after.id,
    data: {
      before: change.before.data(),
      after: change.after.data(),
    },
  };
}
