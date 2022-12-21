import type { Either } from 'fp-ts/Either';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';
import { string } from 'fp-ts-std';
import type { DeepPartial, DeepPick } from 'ts-essentials';

import type { FunctionsBuilder, Stack } from '../type';

export type MakeDeepFilter<T> = T extends Record<string, unknown>
  ? { readonly [TT in keyof T]: MakeDeepFilter<T[TT]> }
  : boolean;

export type StackFilter = DeepPartial<MakeDeepFilter<Stack.Type>>;

export type PartialStack<S extends StackFilter> = DeepPick<Stack.Type, S>;

export type Test<S extends StackFilter, E = unknown, T = unknown> = {
  readonly stack: S;
  readonly name: string;
  readonly expect: (stack: PartialStack<S>) => TaskEither<E, T>;
  readonly toResult: Either<E, T>;
  readonly type?: 'fail';
  readonly timeOut?: number;
  readonly functionsBuilders?: ReadonlyRecord<
    string,
    FunctionsBuilder<PartialStack<S> extends { readonly server: infer SE } ? SE : never>
  >;
  readonly retry?: number;
};

export const defineTest = <S extends StackFilter, E = unknown, T = unknown>(t: Test<S, E, T>) => t;

export const toFunctionsPath = string.replaceAll('bxb/dist/es6')('bxb/dist/cjs');
