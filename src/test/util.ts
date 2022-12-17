import type { Either } from 'fp-ts/Either';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';
import { string } from 'fp-ts-std';

import type { FunctionsBuilder, Stack } from '../type';

export type Test<S = Stack.Type, E = unknown, T = unknown> = {
  readonly name: string;
  readonly expect: (stack: S) => TaskEither<E, T>;
  readonly toResult: Either<E, T>;
  readonly type?: 'fail';
  readonly timeOut?: number;
  readonly functionsBuilders?: ReadonlyRecord<
    string,
    FunctionsBuilder<S extends { readonly server: infer SE } ? SE : never>
  >;
  readonly retry?: number;
};

export type Suite = {
  readonly name: string;
  readonly tests: readonly Test[];
  readonly concurrent?: boolean;
  readonly timeOut?: number;
};

export const defineTest = <S = Stack.Type, E = unknown, T = unknown>(t: Test<S, E, T>) => t;

export const toFunctionsPath = string.replaceAll('bxb/dist/es6')('bxb/dist/cjs');
