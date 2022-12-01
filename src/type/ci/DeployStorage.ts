import type { TaskEither } from 'fp-ts/TaskEither';

export type Param = {
  readonly securityRule?: {
    readonly type?: 'allowAll';
  };
};

export type Fn = (p: Param) => TaskEither<{ readonly code: string }, unknown>;
