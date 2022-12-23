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

export type SequentialTest = {
  readonly type: 'sequential';
  readonly stack: AnyFilter;
  readonly name: string;
  readonly tests: Record<
    string,
    {
      readonly expect: (stack: unknown) => TaskEither<unknown, unknown>;
      readonly toResult: Either<unknown, unknown>;
      readonly shouldTimeout?: true;
      readonly timeOut?: number;
      readonly functionsBuilders?: ReadonlyRecord<string, unknown>;
    }
  >;
};

export type DefineSequentialTest = <S extends StackFilter, E, T>(t: {
  readonly stack: AnyFilter;
  readonly name: string;
  readonly tests: Record<
    string,
    {
      readonly expect: (stack: StackFromFilter<S>) => TaskEither<E, T>;
      readonly toResult: Either<E, T>;
      readonly shouldTimeout?: true;
      readonly timeOut?: number;
      readonly functionsBuilders?: ReadonlyRecord<
        string,
        FunctionsBuilder<StackFromFilter<S> extends { readonly server: infer SE } ? SE : never>
      >;
    }
  >;
}) => SequentialTest;

export const defineSequentialTest: DefineSequentialTest = (t) =>
  ({ ...t, type: 'sequential' } as SequentialTest);

export type SingleTest = {
  readonly type: 'single';
  readonly stack: AnyFilter;
  readonly name: string;
  readonly expect: (stack: unknown) => TaskEither<unknown, unknown>;
  readonly toResult: Either<unknown, unknown>;
  readonly shouldTimeout?: true;
  readonly timeOut?: number;
  readonly functionsBuilders?: ReadonlyRecord<string, unknown>;
  readonly retry?: number;
};

export type DefineSingleTest = <S extends StackFilter, E, T>(t: {
  readonly stack: S;
  readonly name: string;
  readonly expect: (stack: StackFromFilter<S>) => TaskEither<E, T>;
  readonly toResult: Either<E, T>;
  readonly shouldTimeout?: true;
  readonly timeOut?: number;
  readonly functionsBuilders?: ReadonlyRecord<
    string,
    FunctionsBuilder<StackFromFilter<S> extends { readonly server: infer SE } ? SE : never>
  >;
  readonly retry?: number;
}) => SingleTest;

export const test: DefineSingleTest = (t) => ({ ...t, type: 'single' } as SingleTest);

export const toFunctionsPath = std.string.replaceAll('bxb/dist/es6')('bxb/dist/cjs');

export type Test = SequentialTest | SingleTest;

export type ScopeTests = ReadonlyRecord<string, ReadonlyRecord<string, Test>>;

export const exportScopeTests = (scopeTests: ScopeTests): readonly Test[] =>
  pipe(
    scopeTests,
    readonlyRecord.mapWithIndex((capabilityName, capabilityTests) =>
      pipe(
        capabilityTests,
        readonlyRecord.map((t) => ({ ...t, name: `${capabilityName} > ${t.name}` })),
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
        readonlyArray.map((t) => ({ ...t, name: `${scopeName} > ${t.name}` }))
      )
    ),
    readonlyRecord.toReadonlyArray,
    readonlyArray.chain(readonlyTuple.snd)
  );
