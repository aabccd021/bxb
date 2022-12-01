import * as DeployDb from './DeployDb';
import * as DeployStorage from './DeployStorage';
export type Type = {
  readonly deployDb: DeployDb.Fn;
  readonly deployStorage: DeployStorage.Fn;
};
export { DeployDb, DeployStorage };
