export const makeCollectionPath = (collection: string, view?: string): string => {
  const viewSuffix = view !== undefined ? `_${view}` : '';
  const collectionRef = collection + viewSuffix;
  return collectionRef;
};

export const makeDocPath = (collection: string, id: string, view?: string): string => {
  const collectionPath = makeCollectionPath(collection, view);
  return `${collectionPath}/${id}`;
};
