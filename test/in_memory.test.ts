import { task } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { behavior, expect, mkTest, runVitest } from 'unit-test-ts';
import * as vitest from 'vitest';

import { CreateUserAndSignInError } from '../src/a';

const yaaProvider: CreateUserAndSignInError['Provider'] = CreateUserAndSignInError.Provider({
  value: 'yaa',
});

const barUserAlreadyExists: CreateUserAndSignInError['UserAlreadyExists'] =
  CreateUserAndSignInError.UserAlreadyExists({
    wahaha: 'ggg',
  });

const behaviors = [
  behavior(
    'yyy',
    expect({
      task: task.of(yaaProvider),
      resolvesTo: {
        type: 'Provider',
        value: 'yaa',
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
