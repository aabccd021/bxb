/* eslint-disable functional/no-throw-statement */
import { DocData } from './types';

export function getStringField(data: DocData, fieldName: string): string {
  const fieldValue = data[fieldName];
  if (typeof fieldValue !== 'string') {
    const error = { data, fieldName };
    console.error(error);
    throw Error(JSON.stringify(error));
  }
  return fieldValue;
}

export function getNumberField(data: DocData, fieldName: string): number {
  const fieldValue = data[fieldName];
  if (typeof fieldValue !== 'number') {
    const error = { data, fieldName };
    console.error(error);
    throw Error(JSON.stringify(error));
  }
  return fieldValue;
}
