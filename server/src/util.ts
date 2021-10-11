import { chain, isEmpty, Dictionary, mapValues } from 'lodash';
import { FirestoreDataType, DocumentDataChange, DocumentData } from './type';

/**
 * Throw rejected promises from array of settled promises.
 *
 * @param promiseResults The array of settled promises to process
 */
export function throwRejectedPromises(
  promiseResults: readonly PromiseSettledResult<unknown>[]
  // eslint-disable-next-line functional/no-return-void
): void {
  const errors = chain(promiseResults)
    .map((result) => (result.status === 'rejected' ? result.reason : undefined))
    .compact()
    .value();

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
export function mergeObjectArray<T>(
  objectArray: readonly { readonly [key: string]: T }[]
): { readonly [key: string]: T } {
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
export function compactObject<T>(
  object: Dictionary<T | undefined>
): Dictionary<T> {
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
export function getDocDataChange({
  before,
  after,
}: DocumentDataChange): DocumentData {
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

export function getViewCollectionName(
  collectionName: string,
  viewName: string
): string {
  return `${collectionName}_${viewName}`;
}
