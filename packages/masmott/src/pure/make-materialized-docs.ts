import pick from 'lodash/pick';
import { CollectionViews } from 'src/types/io';
import { Dict, DocData, DocSnapshot, Field } from '../types';

function fromEntries<T extends string, V>(arr: readonly (readonly [T, V])[]): Record<T, V> {
  return Object.fromEntries(arr) as Record<T, V>;
}

export function materialize<
  SELECT_FIELD_NAME extends string,
  DD extends Record<SELECT_FIELD_NAME, Field>,
  COUNT_FIELD_NAME extends string
>(
  selectedFieldNames: readonly SELECT_FIELD_NAME[],
  countFieldNames: readonly COUNT_FIELD_NAME[]
): (
  data: DD
) => { readonly [P in SELECT_FIELD_NAME]: DD[P] } & Record<Exclude<COUNT_FIELD_NAME, keyof DD>, 0> {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return (data) => ({
    ...fromEntries(countFieldNames.map((fieldName) => [fieldName, 0 as const])),
    ...pick(data, selectedFieldNames),
  });
}

const x = materialize<'foo'>(['foo'], ['foo']);
x.foo;

export const schema = {
  foo: {
    view: {
      page: {
        bar: {
          type: 'select',
        },
      },
    },
  },
};

export function makeMaterializedDocs(
  data: DocData,
  collectionViews: CollectionViews
): readonly {
  readonly snapshot: DocSnapshot;
  readonly viewName: string;
}[] {
  return Object.entries(collectionViews).map(([viewName, view]) => {
    const selectedFieldNames = Object.entries(view).reduce(
      (acc: readonly string[], [fieldName, fieldSpec]) => {
        const isSelectedFieldSpec = fieldSpec === undefined;
        if (isSelectedFieldSpec) {
          return [...acc, fieldName];
        }
        return acc;
      },
      []
    );
    const materializedSelects = pick(data, selectedFieldNames);

    const materializedCounts = Object.entries(view).reduce(
      (acc: Dict<0>, [fieldName, fieldSpec]) => {
        const isCountFieldSpec = fieldSpec?.type === 'count';
        if (isCountFieldSpec) {
          return { ...acc, [fieldName]: 0 as const };
        }
        return acc;
      },
      {}
    );

    const materializedData: DocData = {
      ...materializedSelects,
      ...materializedCounts,
    };
    const materializedDocSnapshot: DocSnapshot = {
      exists: true,
      data: materializedData,
    };
    return { snapshot: materializedDocSnapshot, viewName };
  });
}
