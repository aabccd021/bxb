import { pipe } from 'fp-ts/function';
import * as Io from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { IO } from 'fp-ts/lib/IO';

import { MakeTriggers, StorageClient } from '.';
import * as StorageAdmin from './StorageAdmin';
import * as StorageState from './StorageState';

export const of = (makeTriggers: Required<MakeTriggers>): IO<StorageClient> =>
  pipe(StorageState.empty, IORef.newIORef, Io.map(StorageAdmin.of(makeTriggers)));
