import { task } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { behavior, expect, mkTest, runVitest } from 'unit-test-ts';
import * as vitest from 'vitest';

import { SignInError } from '../src/a';

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
];

const main = pipe(
  behaviors,
  mkTest({ hook: { beforeEach: task.of(task.of(42)) } }),
  runVitest(vitest)
);

main();
