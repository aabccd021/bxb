import pick from 'lodash/pick';
import { CollectionViews } from 'src/types/io';
import { Dict, DocData, DocSnapshot } from '../types';

export function makeMaterializedDocs(
  data: DocData,
  collectionViews: CollectionViews
): readonly {
  readonly snapshot: DocSnapshot;
  readonly viewName: string;
}[] {
  return Object.entries(collectionViews).map(([viewName, viewSpec]) => {
    const selectedFieldNames = Object.entries(viewSpec).reduce(
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

    const materializedCounts = Object.entries(viewSpec).reduce(
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
