import type { TaskEither } from 'fp-ts/TaskEither';

export type Param = {
  readonly functions: {
    readonly filePath: string;
    readonly exportPath: readonly (number | string)[];
  };
  readonly server: unknown;
};

type Error = {
  readonly code: 'FailedLoadingFunctions';
  readonly details?: unknown;
};

export type Fn = (
  c: Param
) => TaskEither<Error & { readonly capability: 'ci.deployFunctions' }, undefined | void>;
