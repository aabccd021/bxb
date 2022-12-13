import type { Either } from 'fp-ts/Either';
import type { TaskEither } from 'fp-ts/TaskEither';

import type { Stack } from '../type';

export type Test<T> = {
  readonly name: string;
  readonly expect: (stack: Stack.Type) => TaskEither<unknown, T>;
  readonly toResult: Either<unknown, T>;
  readonly type?: 'fail';
  readonly timeOut?: number;
  readonly retry?: number;
};

export type Suite = {
  readonly name: string;
  readonly tests: readonly Test<unknown>[];
  readonly concurrent?: boolean;
  readonly timeOut?: number;
};

export const defineTest = <T>(t: Test<T>) => t;
