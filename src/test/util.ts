import type { Either } from 'fp-ts/Either';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';
import { string } from 'fp-ts-std';

import type { FunctionsBuilder, Stack } from '../type';

export type Test<E = unknown, T = unknown> = {
  readonly name: string;
  readonly expect: (stack: Stack.Type) => TaskEither<E, T>;
  readonly toResult: Either<E, T>;
  readonly type?: 'fail';
  readonly timeOut?: number;
  readonly functionsBuilders?: ReadonlyRecord<string, FunctionsBuilder>;
  readonly retry?: number;
};

export type Suite = {
  readonly name: string;
  readonly tests: readonly Test[];
  readonly concurrent?: boolean;
  readonly timeOut?: number;
};

export const defineTest = <T>(t: Test<T>) => t;

export const toFunctionsPath = string.replaceAll('masmott/dist/es6')('masmott/dist/cjs');
