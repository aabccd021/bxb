import { pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';

import { MakeTriggers, StorageClient } from '.';
import * as StorageAdmin from './StorageAdmin';
import * as StorageState from './StorageState';

export const of = (makeTriggers: Required<MakeTriggers>): IO.IO<StorageClient> =>
  pipe(StorageState.empty, IORef.newIORef, IO.map(StorageAdmin.of(makeTriggers)));
