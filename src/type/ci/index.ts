import * as DeployDb from './DeployDb';
import type * as DeployFunctions from './DeployFunctions';
import * as DeployStorage from './DeployStorage';
export type Type = {
  readonly deployDb: DeployDb.Fn;
  readonly deployStorage: DeployStorage.Fn;
  readonly deployFunctions: DeployFunctions.Fn;
};
export { DeployDb, DeployStorage };
