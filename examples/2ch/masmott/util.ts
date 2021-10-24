export function makeCollectionPath(
  collection: string,
  viewName?: string
): string {
  const viewSuffix = viewName !== undefined ? `_${viewName}` : "";
  const collectionRef = collection + viewSuffix;
  return collectionRef;
}

export function makeDocPath(
  collection: string,
  id: string,
  viewName?: string
): string {
  const collectionPath = makeCollectionPath(collection, viewName);
  return `${collectionPath}/${id}`;
}
