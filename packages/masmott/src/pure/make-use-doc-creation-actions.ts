import {
  Dict,
  DocCreationData,
  DocKey,
  IncrementSpecs,
  Materialize,
  MutateDocAction,
} from '../types';
import { makeMaterializedDocMutateActions } from './make-materialized-docs';
import { makeCountDocMutateActions } from './make-view-doc-mutation';

export function makeDocCreationPreSetActions<DCD extends DocCreationData>(
  collectionName: string,
  id: string,
  data: DCD,
  incrementSpecs: IncrementSpecs<DCD>,
  materializeViews: Dict<Materialize<DCD>>
): readonly MutateDocAction[] {
  const creationDocMutateAction: MutateDocAction = {
    key: [collectionName, id],
    data: { exists: true, data },
  };

  const countDocMutateActions = makeCountDocMutateActions(
    data,
    1,
    incrementSpecs
  );

  const materializedDocMutateActions = makeMaterializedDocMutateActions(
    collectionName,
    id,
    materializeViews,
    data
  );

  return [
    creationDocMutateAction,
    ...countDocMutateActions,
    ...materializedDocMutateActions,
  ];
}

export function makeDocCreationOnSetErrorActions<DCD extends DocCreationData>(
  collectionName: string,
  id: string,
  data: DCD,
  incrementSpecs: IncrementSpecs<DCD>,
  materializeViews: Dict<Materialize<DCD>>
): readonly MutateDocAction[] {
  const createdDocKey: DocKey = [collectionName, id];

  const creationDocMutateAction: MutateDocAction = {
    key: createdDocKey,
    data: { exists: false },
  };

  const countDocMutateActions = makeCountDocMutateActions(
    data,
    -1,
    incrementSpecs
  );

  const materializedDocMutateActions: readonly MutateDocAction[] = Object.keys(
    materializeViews
  ).map((viewName) => ({
    key: createdDocKey,
    data: { exists: false },
    options: { viewName },
  }));

  return [
    creationDocMutateAction,
    ...countDocMutateActions,
    ...materializedDocMutateActions,
  ];
}
