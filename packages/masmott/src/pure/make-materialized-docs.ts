import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import { CollectionViews } from 'src/types/io';
import { DocData, DocSnapshot } from '../types';

export function makeMaterializedDocs(
  data: DocData,
  collectionViews: CollectionViews
): readonly {
  readonly materializedDoc: DocSnapshot;
  readonly viewName: string;
}[] {
  return Object.entries(collectionViews).map(([viewName, viewSpec]) => {
    const selectedFieldNames: readonly string[] = Object.entries(viewSpec).reduce(
      (acc: readonly string[], [viewFieldName, viewFieldSpec]) => {
        const isSelectViewField = viewFieldSpec === undefined;
        if (isSelectViewField) {
          return [...acc, viewFieldName];
        }
        return acc;
      },
      []
    );
    const materializedSelects = pick(data, selectedFieldNames);
    const materializedCounts = mapValues(viewSpec.countSpecs, () => 0);
    const materializedData: DocData = {
      ...materializedSelects,
      ...materializedCounts,
    };
    const materializedDoc: DocSnapshot = {
      exists: true,
      data: materializedData,
    };
    return { materializedDoc, viewName };
  });
}
