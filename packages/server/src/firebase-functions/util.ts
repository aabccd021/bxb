// eslint-disable-next-line no-restricted-imports
import * as functions from 'firebase-functions';

export function getDocTrigger(
  collectionName: string,
  options?: {
    readonly regions?: ReadonlyArray<
      typeof functions.SUPPORTED_REGIONS[number]
    >;
  }
): functions.firestore.DocumentBuilder {
  const functionWithRegion =
    options?.regions !== undefined
      ? functions.region(...options.regions).firestore
      : functions.firestore;
  return functionWithRegion.document(`${collectionName}/{documentId}`);
}
