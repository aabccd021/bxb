import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Record';
import * as T from 'fp-ts/lib/Task';
import * as ARR from 'fp-ts/lib/ReadonlyArray';
import { flow } from 'lodash';
import mapKeys from 'lodash/mapKeys';
import pick from 'lodash/pick';
import {
  DocumentData,
  DocumentDataChange,
  DocumentSnapshot,
  FirestoreDataType,
  Query,
} from './types';
import { compactObject } from './util';
import { boolean } from 'fp-ts';
import * as STRING from 'fp-ts/lib/string';

/**
 * Prefix a join name to a field name.
 *
 * @param joinName Name of the join view.
 * @param fieldName Field name to prefix.
 * @returns Field name prefixed by join name.
 */
function prefixJoinName(joinName: string, fieldName: string): string {
  const prefixedFieldName = `${joinName}_${fieldName}`;
  return prefixedFieldName;
}

/**
 * Make refId field name of a join view.
 *
 * @param joinName Name of the join view.
 * @returns Name of refId field of the view.
 */
function makeRefIdFieldName(joinName: string): string {
  return prefixJoinName(joinName, 'id');
}

/**
 * Creates document data with fields name prefixed by join name.
 *
 * @param docData Document data to be process.
 * @param joinName Name of the join view
 * @returns Document data with prefixed fields name.
 */
function prefixJoinNameOnDocData(docData: DocumentData, joinName: string): DocumentData {
  return mapKeys(docData, (_, fieldName) => prefixJoinName(joinName, fieldName));
}

function materializeJoinData(
  joinName: string,
  refDoc: DocumentSnapshot,
  selectedFieldNames: readonly string[]
): DocumentData {
  const selectedFieldDocData = pick(refDoc.data, selectedFieldNames);
  const compactDocData = compactObject(selectedFieldDocData);

  const prefixedData = prefixJoinNameOnDocData(compactDocData, joinName);

  const refIdFieldName = makeRefIdFieldName(joinName);

  const docDataWithRefId = {
    ...prefixedData,
    [refIdFieldName]: refDoc.id,
  };

  return docDataWithRefId;
}

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

const keyIncludedIn = (arr: readonly string[]) => (key: string, _value: unknown) =>
  ARR.elem(STRING.Eq)(key)(arr);

/**
 *
 */
const makeToViewDocUpdate = (selectedFieldNames: readonly string[]) =>
  flow(getDocDataChange, R.filterWithIndex(keyIncludedIn(selectedFieldNames)), noneIfEmtpyElseSome);

/**
 *
 */
const makeQuery =
  (refIdFieldName: string, refDocId: string): Query =>
  (collectionRef) =>
    collectionRef.where(refIdFieldName, '==', refDocId);

export { doNothing, noneIfEmtpyElseSome, makeToViewDocUpdate, makeQuery };
