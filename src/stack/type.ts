import type { IO } from 'fp-ts/IO';
import type { IORef } from 'fp-ts/IORef';
import type { Option } from 'fp-ts/Option';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { DeepPick } from 'ts-essentials';

import type { DeployFunctionParam, Stack, StackWithEnv } from '../type';

export type MockableWindow = DeepPick<
  typeof window,
  {
    readonly location: {
      readonly origin: never;
      readonly href: never;
    };
    readonly localStorage: never;
  }
>;

export type Env = {
  readonly onAuthStateChangedCallback: IORef<Option<Stack.client.auth.OnAuthStateChanged.Param>>;
  readonly onDocChangedCallback: IORef<
    ReadonlyRecord<string, Stack.client.db.OnSnapshot.OnChangedCallback>
  >;
  readonly dbDeployConfig: IORef<Option<Stack.ci.DeployDb.Param>>;
  readonly storageDeployConfig: IORef<Option<Stack.ci.DeployStorage.Param>>;
  readonly functions: IORef<Option<DeployFunctionParam>>;
  readonly getWindow: IO<MockableWindow>;
};

export type StackType = {
  readonly env: {
    readonly client: Env;
    readonly ci: Env;
    readonly server: Env;
  };
};

export type Stack = StackWithEnv<StackType>;
