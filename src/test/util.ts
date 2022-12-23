import { readonlyArray, readonlyRecord, readonlyTuple } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';
import * as std from 'fp-ts-std';
import type { DeepPartial, DeepPick } from 'ts-essentials';

import type { FunctionsBuilder, Stack } from '../type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Capability = (...p: readonly any[]) => any;

// eslint-disable-next-line no-use-before-define
export type StackOrCapability = Capability | CapabilitySet;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type CapabilitySet = {
  readonly [key: string]: StackOrCapability;
};

export type MakeStackOrCapabilityFilter<T extends StackOrCapability> = T extends Capability
  ? true
  : T extends CapabilitySet
  ? // eslint-disable-next-line no-use-before-define
    MakeStackFilter<T>
  : never;

export type MakeStackFilter<T extends CapabilitySet> = {
  readonly [KK in keyof T]?: MakeStackOrCapabilityFilter<T[KK]>;
};

export type AnyFilter = {
  readonly [key: string]: AnyFilter | true;
};

export type StackFilter = AnyFilter & MakeStackFilter<Stack.Type>;

export type StackFromFilter<S extends StackFilter> = DeepPick<Stack.Type, S>;

export type AnyStack = DeepPartial<Stack.Type>;

export type Test<S extends StackFilter = StackFilter, E = unknown, T = unknown> = {
  readonly stack: S;
  readonly name: string;
  readonly expect: (stack: StackFromFilter<S>) => TaskEither<E, T>;
  readonly toResult: Either<E, T>;
  readonly type?: 'fail';
  readonly timeOut?: number;
  readonly functionsBuilders?: ReadonlyRecord<
    string,
    FunctionsBuilder<StackFromFilter<S> extends { readonly server: infer SE } ? SE : never>
  >;
  readonly retry?: number;
};

export const defineTest = <S extends StackFilter = StackFilter, E = unknown, T = unknown>(
  t: Test<S, E, T>
) => t;

export const toFunctionsPath = std.string.replaceAll('bxb/dist/es6')('bxb/dist/cjs');

export type ScopeTests = ReadonlyRecord<string, ReadonlyRecord<string, Test>>;

export const exportScopeTests = (scopeTests: ScopeTests) =>
  pipe(
    scopeTests,
    readonlyRecord.mapWithIndex((capabilityName, capabilityTests) =>
      pipe(
        capabilityTests,
        readonlyRecord.map((test) => ({ ...test, name: `${capabilityName} > ${test.name}` })),
        readonlyRecord.toReadonlyArray,
        readonlyArray.map(readonlyTuple.snd)
      )
    ),
    readonlyRecord.toReadonlyArray,
    readonlyArray.chain(readonlyTuple.snd)
  );

export const flattenTests = (
  testsModules: ReadonlyRecord<string, { readonly tests: readonly Test[] }>
): readonly Test[] =>
  pipe(
    testsModules,
    readonlyRecord.mapWithIndex((scopeName, scopeTests) =>
      pipe(
        scopeTests.tests,
        readonlyArray.map((test) => ({
          ...test,
          name: `${scopeName} > ${test.name}`,
        }))
      )
    ),
    readonlyRecord.toReadonlyArray,
    readonlyArray.chain(readonlyTuple.snd)
  );
