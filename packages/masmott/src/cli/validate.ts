/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */
import { CollectionSpec, Masmott, VS } from 'core';

const valColViewSelectView =
  (colName: string, colSpec: CollectionSpec) =>
  ([viewName, viewSpec]: readonly [string, VS]) =>
    Object.keys(viewSpec.select).forEach((selectViewFieldName) => {
      if (!Object.keys(colSpec.data ?? {}).includes(selectViewFieldName)) {
        throw Error(
          `Invalid masmott config:` +
            ` "spec.${colName}.view.${viewName}.select.${selectViewFieldName}".` +
            ` Field with name "${selectViewFieldName}" does not exists on collection "${colName}"`
        );
      }
    });

const valColSelectView = ([colName, colSpec]: readonly [string, CollectionSpec]) =>
  Object.entries(colSpec.view ?? {}).forEach(valColViewSelectView(colName, colSpec));

export const valSelectView = (masmott: Masmott) =>
  Object.entries(masmott.spec).forEach(valColSelectView);

export const validate = valSelectView;
