import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import {
  DataTypeName,
  FirestoreDataType,
  SelectedFieldNames as SelectViewSpec,
} from './type';

function validateDataType(
  data: unknown,
  expectedDataType: DataTypeName
): FirestoreDataType {
  if (expectedDataType === 'string' && typeof data === 'string') {
    return data;
  }

  functions.logger.error('Invalid Data Type', {
    data,
    dataType: expectedDataType,
  });
  throw Error();
}

export function initializeSelectView(
  snapshot: functions.firestore.QueryDocumentSnapshot,
  selectedFields: SelectViewSpec
): { readonly [key: string]: FirestoreDataType } {
  return _.mapValues(selectedFields, (expectedDataType, selectedFieldName) => {
    const selectedData = snapshot.data()[selectedFieldName];
    const validatedData = validateDataType(selectedData, expectedDataType);
    return validatedData;
  });
}
