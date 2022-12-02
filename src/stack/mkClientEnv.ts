import { apply, io, ioRef, option } from 'fp-ts';
import type { IO } from 'fp-ts/IO';

import type { Env, MockableWindow } from './type';

export const mkClientEnvFromWindow = (getGetWindow: IO<IO<MockableWindow>>): IO<Env> =>
  apply.sequenceS(io.Apply)({
    onAuthStateChangedCallback: ioRef.newIORef(option.none),
    dbDeployConfig: ioRef.newIORef(option.none),
    functions: ioRef.newIORef(option.none),
    getWindow: getGetWindow,
  });

export const mkClientEnv = mkClientEnvFromWindow(() => () => window);
