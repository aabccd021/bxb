import { io, taskEither } from 'fp-ts';
import { Window } from 'happy-dom';

import { mkClientEnvFromWindow, stack } from '../src/';
import { runTests } from '../src/test';

const mkTestClientEnv = mkClientEnvFromWindow(() => io.of(new Window()));

runTests(stack, taskEither.fromIO(mkTestClientEnv));
