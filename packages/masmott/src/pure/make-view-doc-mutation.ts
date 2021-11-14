import { DocData, DocKey, DocSnapshot, DocSnapshotMutatorCallback, getStringField } from 'masmott';
import { Schema } from 'src/types/io';

function makeIncrementField<FN extends string, DD extends { readonly [P in FN]: number } & DocData>(
  fieldName: FN,
  incrementValue: 1 | -1
): DocSnapshotMutatorCallback<DD> {
  return (viewDoc): DocSnapshot => {
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

export type ViewDocMutation = {
  readonly docKey: DocKey;
  readonly mutatorCallback: DocSnapshotMutatorCallback;
  readonly viewName: string;
};

export function makeViewDocMutations(
  data: DocData,
  incrementValue: 1 | -1,
  schema: Schema,
  updatedCollectionName: string
): readonly ViewDocMutation[] {
  return Object.entries(schema).flatMap(([viewCollectionName, { view: collectionViews }]) =>
    Object.entries(collectionViews ?? {}).flatMap(([viewName, viewFields]) =>
      Object.entries(viewFields).reduce(
        (acc: readonly ViewDocMutation[], [counterFieldName, viewFieldSpec]) => {
          if (viewFieldSpec?.type === 'count') {
            const { groupBy: refIdFieldName, count: countedCollectionName } = viewFieldSpec;

            if (countedCollectionName !== updatedCollectionName) {
              return acc;
            }

            const viewId = getStringField(data, refIdFieldName);
            const docKey: DocKey = [viewCollectionName, viewId];

            const incrementField = makeIncrementField(
              counterFieldName,
              incrementValue
            ) as DocSnapshotMutatorCallback;

            const mutation: ViewDocMutation = {
              docKey,
              mutatorCallback: incrementField,
              viewName,
            };

            return [...acc, mutation];
          }
          return acc;
        },
        []
      )
    )
  );
}
