import { io } from 'fp-ts';
import { Window } from 'happy-dom';

import { mkClientEnvFromWindow, stack } from '../src';
import { tests } from '../src/test';

const mkTestClientEnv = mkClientEnvFromWindow(() => io.of(new Window()));

tests(stack, mkTestClientEnv);
