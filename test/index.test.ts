import { io, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Window } from 'happy-dom';

import { mkEnvFromWindow, stack } from '../src';
import type { StackType } from '../src/stack/type';
import { runTests } from '../src/test';

const mkTestClientEnv = pipe(
  mkEnvFromWindow(() => io.of(new Window())),
  io.map((env) => ({ server: env, ci: env, client: env }))
);

runTests<StackType>(stack, taskEither.fromIO(mkTestClientEnv));
