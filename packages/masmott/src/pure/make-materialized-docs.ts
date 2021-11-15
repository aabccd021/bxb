/* eslint-disable no-use-before-define */
import pick from 'lodash/pick';
import { Dict, DocCreationData, MutateDocAction } from '../types';

function fromEntries<T extends string, V>(arr: readonly (readonly [T, V])[]): Record<T, V> {
  return Object.fromEntries(arr) as Record<T, V>;
}

export type Materialize<
  DD extends DocCreationData,
  SELECT_FIELD_NAME extends keyof DD = keyof DD,
  COUNT_FIELD_NAME extends Exclude<string, keyof DD> = Exclude<string, keyof DD>
> = (
  data: DD
) => { readonly [P in SELECT_FIELD_NAME]: DD[P] } & Record<
  Exclude<COUNT_FIELD_NAME, keyof DD>,
  number
>;

export function makeMaterialize<
  DD extends DocCreationData,
  SELECT_FIELD_NAME extends keyof DD,
  COUNT_FIELD_NAME extends Exclude<string, keyof DD>
>(
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
  return Object.entries(materializeViews).map(([viewName, materializeView]) => ({
    key: [collectionName, id],
    data: {
      exists: true,
      data: materializeView(data),
    },
    options: { viewName },
  }));
}
