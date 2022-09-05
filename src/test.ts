import { blob } from 'dom-utils-ts';
import { option, task, taskOption } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { taskRefUtil } from 'ioref-utils-ts';
import { expect, Tests } from 'unit-test-ts';

import { MakeClient } from '../src';

export const makeTests = (makeClient: MakeClient): Tests => ({
  'can upload and download': expect({
    task: pipe(
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

  'can run trigger when object uploaded': expect({
    task: pipe(
      task.Do,
      task.bind('logs', taskRefUtil.appendonlyArray),
      task.bind('client', ({ logs }) =>
        makeClient({
          storage: () => ({ onUploaded: logs.append }),
        })
      ),
      task.chainFirst(({ client }) =>
        client.storage.upload({
          id: 'sakurazaka/kira',
          blob: blob.fromString('masumoto'),
        })
      ),
      task.chain(({ logs }) => logs.read)
    ),
    toEqual: ['sakurazaka/kira'],
  }),

  'still upload when having trigger': expect({
    task: pipe(
      task.Do,
      task.bind('logs', taskRefUtil.appendonlyArray),
      task.bind('client', ({ logs }) =>
        makeClient({
          storage: () => ({ onUploaded: logs.append }),
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

  'can download inside trigger': expect({
    task: pipe(
      task.Do,
      task.bind('logs', taskRefUtil.appendonlyArray),
      task.bind('client', ({ logs }) =>
        makeClient({
          storage: (storageAdmin) => ({
            onUploaded: flow(
              storageAdmin.download,
              taskOption.chain(flow(blob.text, taskOption.fromTask)),
              task.chain(logs.append)
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
      task.chain(({ logs }) => logs.read)
    ),
    toEqual: [option.some('masumoto')],
  }),

  'can set doc and get doc': expect({
    task: pipe(
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

  'returns empty option when getDoc non existing': expect({
    task: pipe(
      task.Do,
      task.bind('client', () => makeClient({})),
      task.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
    ),
    toEqual: option.none,
  }),
});
