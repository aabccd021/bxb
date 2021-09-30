import { pick } from 'lodash';
import { DocumentData } from '../type';

export function materializeSelectViewData(
  srcDocData: DocumentData,
  selectedFieldNames: readonly string[]
): DocumentData {
  const selectedDocData = pick(srcDocData, selectedFieldNames);
  return selectedDocData;
}
