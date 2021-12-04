/* eslint-disable no-use-before-define */
import pick from 'lodash/pick';
import { Dict, DocCreationData, Materialize, MutateDocAction } from '../types';

function fromEntries<T extends string, V>(
  arr: readonly (readonly [T, V])[]
): Record<T, V> {
  return Object.fromEntries(arr) as Record<T, V>;
}

export function makeMaterialize(
  selectedFieldNames: readonly SELECT_FIELD_NAME[],
  countFieldNames: readonly COUNT_FIELD_NAME[]
): Materialize<DD, SELECT_FIELD_NAME, COUNT_FIELD_NAME> {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return (data) => ({
    ...fromEntries(countFieldNames.map((fieldName) => [fieldName, 0])),
    ...pick(data, selectedFieldNames),
  });
}

export function makeMaterializedDocMutateActions<DCD extends DocCreationData>(
  collectionName: string,
  id: string,
  materializeViews: Dict<Materialize<DCD>>,
  data: DCD
): readonly MutateDocAction[] {
  return Object.entries(materializeViews).map(
    ([viewName, materializeView]) => ({
      key: [collectionName, id],
      data: {
        exists: true,
        data: {
          ...fromEntries(countFieldNames.map((fieldName) => [fieldName, 0])),
          ...pick(data, selectedFieldNames),
        },
      },
      options: { viewName },
    })
  );
}
