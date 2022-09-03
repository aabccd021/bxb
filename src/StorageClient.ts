import { pipe } from 'fp-ts/function';
import * as Io from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { IO } from 'fp-ts/lib/IO';

import { Config, StorageClient } from '.';
import * as StorageAdmin from './StorageAdmin';
import * as StorageState from './StorageState';

export const of = (config: Required<Config>): IO<StorageClient> =>
  pipe(StorageState.empty, IORef.newIORef, Io.map(StorageAdmin.of(config)));
