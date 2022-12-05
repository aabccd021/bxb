import type { IO } from 'fp-ts/IO';
import type { IORef } from 'fp-ts/IORef';
import type { Option } from 'fp-ts/Option';
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
  readonly dbDeployConfig: IORef<Option<Stack.ci.DeployDb.Param>>;
  readonly functions: IORef<Option<DeployFunctionParam>>;
  readonly getWindow: IO<MockableWindow>;
};

export type Stack = StackWithEnv<Env>;
