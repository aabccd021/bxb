import type { StackWithEnv } from 'bxb';

export type StackT = {
  readonly env: {
    readonly client: unknown;
    readonly server: unknown;
    readonly ci: unknown;
  };
};

export type Stack = StackWithEnv<StackT>;
