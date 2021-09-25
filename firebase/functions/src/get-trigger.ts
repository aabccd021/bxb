import { mapValues } from 'lodash';
import { Config, GetVFTriggerContext, MasmottTrigger, VFTrigger } from './type';

export function getTrigger<SFSpec, VFSpec>({
  config,
  getVfTrigger,
}: {
  readonly config: Config<SFSpec, VFSpec>;
  readonly getVfTrigger: (
    context: GetVFTriggerContext,
    vfSpec: VFSpec
  ) => VFTrigger;
}): MasmottTrigger {
  return mapValues(config, (collectionConfig, viewCollectionName) =>
    mapValues(collectionConfig.view, (view, viewName) =>
      mapValues(view, (vfSpec, vfName) =>
        getVfTrigger({ vfName, viewCollectionName, viewName }, vfSpec)
      )
    )
  );
}
