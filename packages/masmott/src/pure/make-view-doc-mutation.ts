import {
  DocCreationData,
  DocData,
  DocKey,
  DocSnapshot,
  DocSnapshotMutatorCallback,
  IncrementSpecs,
  MutateDocAction,
} from 'masmott';

export function makeIncrementField<FN extends string, DD extends Record<FN, number> & DocData>(
  fieldName: FN
): (incrementValue: 1 | -1) => DocSnapshotMutatorCallback<DD> {
  return (incrementValue) =>
    (viewDoc): DocSnapshot => {
      if (!viewDoc.exists) {
        return viewDoc;
      }
      const counterFieldValue = viewDoc.data[fieldName];
      const updatedCounterFieldValue = counterFieldValue + incrementValue;
      const updatedViewData: DocData = {
        ...viewDoc.data,
        [fieldName]: updatedCounterFieldValue,
      };
      const updatedViewDoc: DocSnapshot = {
        ...viewDoc,
        data: updatedViewData,
      };
      return updatedViewDoc;
    };
}

export function makeCountDocMutateActions<DCD extends DocCreationData>(
  data: DCD,
  incrementValue: 1 | -1,
  incrementSpecs: IncrementSpecs<DCD>
): readonly MutateDocAction[] {
  return Object.entries(incrementSpecs).flatMap(([viewCollectionName, collectionViews]) =>
    Object.entries(collectionViews ?? {}).flatMap(([viewName, viewDocMutation]) =>
      Object.entries(viewDocMutation).map(([, { getDocId, makeMutatorCallback }]) => {
        const viewId = getDocId(data);
        const key: DocKey = [viewCollectionName, viewId];
        const mutatorCallback = makeMutatorCallback(incrementValue) as DocSnapshotMutatorCallback;

        const action: MutateDocAction = {
          key,
          data: mutatorCallback,
          options: {
            viewName,
          },
        };

        return action;
      })
    )
  );
}