import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as ARR from 'fp-ts/lib/ReadonlyArray';
import * as R from 'fp-ts/lib/Record';
import * as STRING from 'fp-ts/lib/string';
import * as T from 'fp-ts/lib/Task';
import { flow } from 'lodash';
import mapKeys from 'lodash/mapKeys';
import {
  DocumentData,
  DocumentDataChange,
  DocumentSnapshot,
  FirestoreDataType,
  Query,
} from './types';

/**
 * Prefix a join name to a field name.
 */
const prefixJoinName = (fieldName: string) => (joinName: string) => `${joinName}_${fieldName}`;

/**
 * Make refId field name of a join view.
 */
const makeRefIdFieldName = prefixJoinName('id');

/**
 * Creates document data with fields name prefixed by join name.
 */
const prefixDocData =
  (joinName: string) =>
  (docData: DocumentData): DocumentData =>
    mapKeys(docData, (_, fieldName) => prefixJoinName(fieldName)(joinName));

/**
 *
 */
const materializeJoinData = (
  joinName: string,
  selectedFieldNames: readonly string[],
  refDoc: DocumentSnapshot
): DocumentData => {
  const refIdFieldName = makeRefIdFieldName(joinName);
  return pipe(
    refDoc.data,
    pick(selectedFieldNames),
    prefixDocData(joinName),
    R.upsertAt(refIdFieldName, refDoc.id as FirestoreDataType)
  );
};

/**
 *
 */
const getValueChange =
  (beforeValue: FirestoreDataType) =>
  (after: O.Option<FirestoreDataType>): O.Option<FirestoreDataType> => {
    if (typeof beforeValue === 'string' && O.isSome(after) && typeof after.value === 'string') {
      return beforeValue !== after.value ? O.some(after.value) : O.none;
    }
    throw Error(JSON.stringify({ beforeValue, afterValue: after }));
  };

/**
 *
 */
const getFieldDiffWith =
  (after: DocumentData) => (fieldName: string, beforeFieldData: FirestoreDataType) =>
    pipe(after, R.lookup(fieldName), getValueChange(beforeFieldData));

/**
 *
 */
const getDiffWith = (after: DocumentData) => R.mapWithIndex(getFieldDiffWith(after));

/**
 *
 */
const getDocDataChange = ({ before, after }: DocumentDataChange): DocumentData =>
  pipe(before, getDiffWith(after), R.compact);

/**
 *
 */
const doNothing = (): T.Task<unknown> => () => Promise.resolve();

/**
 *
 */
const noneIfEmtpyElseSome = (data: DocumentData) => (R.isEmpty(data) ? O.none : O.some(data));

/**
 *
 */
const keyIncludedIn = (arr: readonly string[]) => (key: string, _value: unknown) =>
  ARR.elem(STRING.Eq)(key)(arr);

/**
 *
 */
const pick = (keys: readonly string[]) => R.filterWithIndex(keyIncludedIn(keys));

/**
 *
 */
const makeToViewDocUpdate = (selectedFieldNames: readonly string[]) =>
  flow(getDocDataChange, pick(selectedFieldNames), noneIfEmtpyElseSome);

/**
 *
 */
const makeQuery =
  (refIdFieldName: string, refDocId: string): Query =>
  (collectionRef) =>
    collectionRef.where(refIdFieldName, '==', refDocId);

export { doNothing, makeToViewDocUpdate, makeQuery, materializeJoinData };
