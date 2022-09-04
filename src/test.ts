import { blob } from 'dom-utils-ts';
import { option, task, taskOption } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { taskRefUtil } from 'ioref-utils-ts';
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

  'still upload when having trigger': pass({
    expect: pipe(
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

  'can download inside trigger': pass({
    expect: pipe(
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
