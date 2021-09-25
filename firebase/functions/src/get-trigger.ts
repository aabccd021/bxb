import { mapValues } from 'lodash';
import {
  Collection,
  GetVFTriggerContext,
  MasmottTrigger,
  VFTrigger,
} from './type';

export function getTrigger<SFSpec, VFSpec>({
  collection,
  getVfTrigger,
}: {
  readonly collection: Collection<SFSpec, VFSpec>;
  readonly getVfTrigger: (
    context: GetVFTriggerContext,
    vfSpec: VFSpec
  ) => VFTrigger;
}): MasmottTrigger {
  return mapValues(collection, (collectionConfig, viewCollectionName) =>
    mapValues(collectionConfig.view, (view, viewName) =>
      mapValues(view, (vfSpec, vfName) =>
        getVfTrigger({ vfName, viewCollectionName, viewName }, vfSpec)
      )
    )
  );
}
