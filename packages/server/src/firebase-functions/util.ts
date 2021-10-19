// eslint-disable-next-line no-restricted-imports
import { firestore, region, SUPPORTED_REGIONS } from 'firebase-functions';

export function getDocTrigger(
  collectionName: string,
  options?: {
    readonly regions?: ReadonlyArray<typeof SUPPORTED_REGIONS[number] | string>;
  }
): firestore.DocumentBuilder {
  const functionWithRegion =
    options?.regions !== undefined
      ? region(...options.regions).firestore
      : firestore;
  return functionWithRegion.document(`${collectionName}/{documentId}`);
}
