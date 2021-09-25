import { mapValues } from 'lodash';
import { Config, VFTrigger } from './type';

export type MasmottTrigger = {
  readonly [key: string]: {
    readonly [key: string]: {
      readonly [key: string]: VFTrigger;
    };
  };
};

export function getTrigger<SFSpec, VFSpec>({
  config,
  getVfTrigger,
}: {
  readonly config: Config<SFSpec, VFSpec>;
  readonly getVfTrigger: (p: {
    readonly vfName: string;
    readonly vfSpec: VFSpec;
    readonly viewCollectionName: string;
    readonly viewName: string;
  }) => VFTrigger;
}): MasmottTrigger {
  return mapValues(config, (collectionConfig, viewCollectionName) =>
    mapValues(collectionConfig.view, (view, viewName) =>
      mapValues(view, (vfSpec, vfName) =>
        getVfTrigger({
          vfName,
          vfSpec,
          viewCollectionName,
          viewName,
        })
      )
    )
  );
}
