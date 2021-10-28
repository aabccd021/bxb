/* istanbul ignore file */

import { firestore, region, SUPPORTED_REGIONS } from 'firebase-functions';
import { FunctionsFirestore } from '../types';

export function getFunctionsFirestore(
  regions?: ReadonlyArray<typeof SUPPORTED_REGIONS[number]>
): FunctionsFirestore {
  return regions !== undefined ? region(...regions).firestore : firestore;
}
