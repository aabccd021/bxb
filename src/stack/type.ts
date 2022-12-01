import type { IO } from 'fp-ts/IO';
import type { IORef } from 'fp-ts/IORef';
import type { Option } from 'fp-ts/Option';
import type { DeepPick } from 'ts-essentials';

import type { DeployDb, OnAuthStateChangedParam, Stack as _Stack } from '../type';

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
  readonly onAuthStateChangedCallback: IORef<Option<OnAuthStateChangedParam>>;
  readonly dbDeployConfig: IORef<Option<DeployDb.Config>>;
  readonly getWindow: IO<MockableWindow>;
};

export type Stack = _Stack<Env>;
