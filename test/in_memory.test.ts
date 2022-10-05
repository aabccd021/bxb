import { task } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { behavior, expect, mkTest, runVitest } from 'unit-test-ts';
import * as vitest from 'vitest';

import { SignInError } from '../src/a';

const yaaProvider: SignInError['Provider'] = SignInError.Provider({
  value: 76,
});

export const kkkProvider = SignInError.Provider({
  value: 99,
});

export const yooProvider: SignInError['Provider'] = {
  type: 'Provider',
  value: 99,
};

const barUserAlreadyExists: SignInError['UserAlreadyExists'] = SignInError.UserAlreadyExists({
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
