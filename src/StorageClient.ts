import { io, ioRef } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { Config, StorageClient } from '.';
import * as StorageAdmin from './StorageAdmin';
import * as StorageState from './StorageState';

export const of = (config: Required<Config>): io.IO<StorageClient> =>
  pipe(StorageState.empty, ioRef.newIORef, io.map(StorageAdmin.of(config)));
