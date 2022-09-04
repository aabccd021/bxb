import { blob } from 'dom-utils-ts';
import { io, ioRef, option, readonlyArray, task, taskOption } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { pass, Tests } from 'unit-test-ts';

import { MakeClient } from '../src';

export const makeTests = (makeClient: MakeClient): Tests => ({
  'can upload and download': pass({
    expect: pipe(
      task.Do,
      task.bind('client', () => makeClient({})),
      task.chainFirst(({ client }) =>
        client.storage.upload({
          id: 'sakurazaka/kira',
          blob: blob.fromString('masumoto'),
        })
      ),
      task.chain(({ client }) => client.storage.download('sakurazaka/kira')),
      taskOption.chain(flow(blob.text, taskOption.fromTask))
    ),
    toEqual: option.some('masumoto'),
  }),

  'can run trigger when object uploaded': pass({
    expect: pipe(
      task.Do,
      task.bind('logs', () => task.fromIO(ioRef.newIORef<readonly string[]>([]))),
      task.bind('client', ({ logs }) =>
        makeClient({
          storage: () => ({
            onUploaded: (id) =>
              pipe(logs.read, io.map(readonlyArray.append(id)), io.chain(logs.write), task.fromIO),
          }),
        })
      ),
      task.chainFirst(({ client }) =>
        client.storage.upload({
          id: 'sakurazaka/kira',
          blob: blob.fromString('masumoto'),
        })
      ),
      task.chain(({ logs }) => task.fromIO(logs.read))
    ),
    toEqual: ['sakurazaka/kira'],
  }),

  'still upload when having trigger': pass({
    expect: pipe(
      task.Do,
      task.bind('logs', () => task.fromIO(ioRef.newIORef<readonly string[]>([]))),
      task.bind('client', ({ logs }) =>
        makeClient({
          storage: () => ({
            onUploaded: (id) =>
              pipe(logs.read, io.map(readonlyArray.append(id)), io.chain(logs.write), task.fromIO),
          }),
        })
      ),
      task.chainFirst(({ client }) =>
        client.storage.upload({
          id: 'sakurazaka/kira',
          blob: blob.fromString('masumoto'),
        })
      ),
      task.chain(({ client }) => client.storage.download('sakurazaka/kira')),
      taskOption.chain(flow(blob.text, taskOption.fromTask))
    ),
    toEqual: option.some('masumoto'),
  }),

  'can download inside trigger': pass({
    expect: pipe(
      task.Do,
      task.bind('logs', () => task.fromIO(ioRef.newIORef<readonly option.Option<string>[]>([]))),
      task.bind('client', ({ logs }) =>
        makeClient({
          storage: (storageAdmin) => ({
            onUploaded: flow(
              storageAdmin.download,
              taskOption.chain(flow(blob.text, taskOption.fromTask)),
              task.chain((text) =>
                pipe(
                  logs.read,
                  io.map(readonlyArray.append(text)),
                  io.chain(logs.write),
                  task.fromIO
                )
              )
            ),
          }),
        })
      ),
      task.chainFirst(({ client }) =>
        client.storage.upload({
          id: 'sakurazaka/kira',
          blob: blob.fromString('masumoto'),
        })
      ),
      task.chain(({ logs }) => task.fromIO(logs.read))
    ),
    toEqual: [option.some('masumoto')],
  }),

  'can set doc and get doc': pass({
    expect: pipe(
      task.Do,
      task.bind('client', () => makeClient({})),
      task.chainFirst(({ client }) =>
        client.db.setDoc({
          key: { table: 'sakurazaka', id: 'kira' },
          data: { birthYear: 2002 },
        })
      ),
      task.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
    ),
    toEqual: option.of({ birthYear: 2002 }),
  }),

  'returns empty option when getDoc non existing': pass({
    expect: pipe(
      task.Do,
      task.bind('client', () => makeClient({})),
      task.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
    ),
    toEqual: option.none,
  }),
});
