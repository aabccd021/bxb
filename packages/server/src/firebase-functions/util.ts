// eslint-disable-next-line no-restricted-imports
import { firestore } from 'firebase-functions';
import { GetDocTriggerOptions } from '../type';
import { getFunctionsFirestore } from './non-testable';

export function getDocTrigger(
  collectionName: string,
  options?: GetDocTriggerOptions
): firestore.DocumentBuilder {
  const functionsFirestore = getFunctionsFirestore(options?.regions);
  const docTrigger = functionsFirestore.document(
    `${collectionName}/{documentId}`
  );
  return docTrigger;
}
