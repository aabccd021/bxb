/* eslint-disable functional/no-expression-statement */
import { io, ioRef, option, readonlyArray, task } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import { MakeClientWithConfig } from '../src';

export const getTextFromBlob =
  (downloadResult: option.Option<Blob>): task.Task<option.Option<string>> =>
  async () => {
    const donwloadResultBlob: Blob | undefined = pipe(
      downloadResult,
      option.getOrElse<Blob | undefined>(() => undefined)
    );
    const downloadResultText = await donwloadResultBlob?.text();
    return option.fromNullable(downloadResultText);
  };

export const stringToBlob = (text: string) => new Blob([text]);

export type Test<Result> = {
  readonly expect: task.Task<Result>;
  readonly toStrictEqual: Result;
};

export type Tests = Record<string, Record<string, Test<unknown>>>;

const test = <Result>(x: Test<Result>) => x;

export const makeTest = (makeClientWithTrigger: MakeClientWithConfig): Tests => ({
  Storage: {
    'can upload and download': test({
      expect: pipe(
        makeClientWithTrigger({}),
        task.bindTo('client'),
        task.chainFirst(({ client }) =>
          client.storage.upload({
            id: 'sakurazaka/kira',
            blob: stringToBlob('masumoto'),
          })
        ),
        task.chain(({ client }) => client.storage.download('sakurazaka/kira')),
        task.chain(getTextFromBlob)
      ),
      toStrictEqual: option.some('masumoto'),
    }),

    'can run trigger when object uploaded': test({
      expect: pipe(
        ioRef.newIORef<readonly string[]>([]),
        task.fromIO,
        task.bindTo('logs'),
        task.bind('client', ({ logs }) =>
          makeClientWithTrigger({
            storage: () => ({
              onUploaded: (id) =>
                pipe(
                  logs.read,
                  io.map(readonlyArray.append(id)),
                  io.chain(logs.write),
                  task.fromIO
                ),
            }),
          })
        ),
        task.chainFirst(({ client }) =>
          client.storage.upload({
            id: 'sakurazaka/kira',
            blob: stringToBlob('masumoto'),
          })
        ),
        task.chain(({ logs }) => task.fromIO(logs.read))
      ),
      toStrictEqual: ['sakurazaka/kira'],
    }),

    'still upload when having trigger': test({
      expect: pipe(
        ioRef.newIORef<readonly string[]>([]),
        task.fromIO,
        task.bindTo('logs'),
        task.bind('client', ({ logs }) =>
          makeClientWithTrigger({
            storage: () => ({
              onUploaded: (id) =>
                pipe(
                  logs.read,
                  io.map(readonlyArray.append(id)),
                  io.chain(logs.write),
                  task.fromIO
                ),
            }),
          })
        ),
        task.chainFirst(({ client }) =>
          client.storage.upload({
            id: 'sakurazaka/kira',
            blob: stringToBlob('masumoto'),
          })
        ),
        task.chain(({ client }) => client.storage.download('sakurazaka/kira')),
        task.chain(getTextFromBlob)
      ),
      toStrictEqual: option.some('masumoto'),
    }),

    'can download inside trigger': test({
      expect: pipe(
        ioRef.newIORef<readonly option.Option<string>[]>([]),
        task.fromIO,
        task.bindTo('logs'),
        task.bind('client', ({ logs }) =>
          makeClientWithTrigger({
            storage: (storageAdmin) => ({
              onUploaded: flow(
                storageAdmin.download,
                task.chain(getTextFromBlob),
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
            blob: stringToBlob('masumoto'),
          })
        ),
        task.chain(({ logs }) => task.fromIO(logs.read))
      ),
      toStrictEqual: [option.some('masumoto')],
    }),
  },

  'Table DB': {
    'can set doc and get doc': test({
      expect: pipe(
        makeClientWithTrigger({}),
        task.bindTo('client'),
        task.chainFirst(({ client }) =>
          client.db.setDoc({
            key: { table: 'sakurazaka', id: 'kira' },
            data: { birthYear: 2002 },
          })
        ),
        task.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
      ),
      toStrictEqual: option.of({ birthYear: 2002 }),
    }),

    'returns empty option when getDoc non existing': test({
      expect: pipe(
        makeClientWithTrigger({}),
        task.bindTo('client'),
        task.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
      ),
      toStrictEqual: option.none,
    }),
  },
});
