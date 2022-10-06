import { task } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { behavior, expect, mkTest, runVitest } from 'unit-test-ts';
import * as vitest from 'vitest';

import { impl, predicate, TypeOf, Variant } from '../src/a';

type SignInErrorUnion<K> =
  | Variant<'Provider', { readonly value: K }>
  | Variant<'UserAlreadyExists', { readonly wahaha: string }>;

// eslint-disable-next-line functional/prefer-tacit
const SignInError = <K>() => impl('type')<SignInErrorUnion<K>>();

type SignInError<K> = TypeOf<ReturnType<typeof SignInError<K>>>;

const NumberSignInError = SignInError<number>();

type NumberSignInError = SignInError<number>;

const yaaProvider: NumberSignInError['Provider'] = NumberSignInError.Provider({
  value: 76,
});

export const kkkProvider = NumberSignInError.Provider({
  value: 99,
});

export const yooProvider: NumberSignInError['Provider'] = {
  type: 'Provider',
  value: 99,
};

const barUserAlreadyExists: NumberSignInError['UserAlreadyExists'] =
  NumberSignInError.UserAlreadyExists({
    wahaha: 'ggg',
  });

export const k: readonly NumberSignInError['Provider'][] = [
  NumberSignInError.Provider({ value: 99 }),
  NumberSignInError.UserAlreadyExists({ wahaha: 'zzz' }),
  NumberSignInError.Provider({ value: 42 }),
  NumberSignInError.UserAlreadyExists({ wahaha: 'kkk' }),
].filter(predicate('type', 'Provider'));

const behaviors = [
  behavior(
    'yyy',
    expect({
      task: task.of(yaaProvider),
      resolvesTo: {
        type: 'Provider',
        value: 76,
      },
    })
  ),

  behavior(
    'zzz',
    expect({
      task: task.of(barUserAlreadyExists),
      resolvesTo: {
        type: 'UserAlreadyExists',
        wahaha: 'ggg',
      },
    })
  ),

  behavior(
    'zzz',
    expect({
      task: task.of(
        [
          NumberSignInError.Provider({ value: 99 }),
          NumberSignInError.UserAlreadyExists({ wahaha: 'zzz' }),
          NumberSignInError.Provider({ value: 42 }),
          NumberSignInError.UserAlreadyExists({ wahaha: 'kkk' }),
        ].filter(predicate('type', 'Provider'))
      ),
      resolvesTo: [
        NumberSignInError.Provider({ value: 99 }),
        NumberSignInError.Provider({ value: 42 }),
      ],
    })
  ),
];

const main = pipe(
  behaviors,
  mkTest({ hook: { beforeEach: task.of(task.of(42)) } }),
  runVitest(vitest)
);

main();
