
import mapKeys from 'lodash/mapKeys';
import pick from 'lodash/pick';
import { DocumentData, DocumentSnapshot } from '../types';
import {
	compactObject
} from '../util';

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



export function materializeJoinData(joinName: string, refDoc: DocumentSnapshot, selectedFieldNames: string[]): DocumentData {
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