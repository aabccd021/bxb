/* eslint-disable functional/no-expression-statement */
import { option, task } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import * as O from 'fp-ts/Option';
import * as Array from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';

import { MakeClientWithConfig } from '../src';

export const getTextFromBlob =
  (downloadResult: option.Option<Blob>): task.Task<option.Option<string>> =>
  async () => {
    const donwloadResultBlob: Blob | undefined = pipe(
      downloadResult,
      O.getOrElse<Blob | undefined>(() => undefined)
    );
    const downloadResultText = await donwloadResultBlob?.text();
    return O.fromNullable(downloadResultText);
  };

export const stringToBlob = (text: string) => new Blob([text]);

export type Test<Result> = {
  readonly expect: T.Task<Result>;
  readonly toStrictEqual: Result;
};

export type Tests = Record<string, Record<string, Test<unknown>>>;

const test = <Result>(x: Test<Result>) => x;

export const makeTest = (makeClientWithTrigger: MakeClientWithConfig): Tests => ({
  Storage: {
    'can upload and download': test({
      expect: pipe(
        makeClientWithTrigger({}),
        T.bindTo('client'),
        T.chainFirst(({ client }) =>
          client.storage.upload({
            id: 'sakurazaka/kira',
            blob: stringToBlob('masumoto'),
          })
        ),
        T.chain(({ client }) => client.storage.download('sakurazaka/kira')),
        T.chain(getTextFromBlob)
      ),
      toStrictEqual: O.some('masumoto'),
    }),

    'can run trigger when object uploaded': test({
      expect: pipe(
        IORef.newIORef<readonly string[]>([]),
        T.fromIO,
        T.bindTo('logs'),
        T.bind('client', ({ logs }) =>
          makeClientWithTrigger({
            storage: () => ({
              onUploaded: (id) =>
                pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO),
            }),
          })
        ),
        T.chainFirst(({ client }) =>
          client.storage.upload({
            id: 'sakurazaka/kira',
            blob: stringToBlob('masumoto'),
          })
        ),
        T.chain(({ logs }) => T.fromIO(logs.read))
      ),
      toStrictEqual: ['sakurazaka/kira'],
    }),

    'still upload when having trigger': test({
      expect: pipe(
        IORef.newIORef<readonly string[]>([]),
        T.fromIO,
        T.bindTo('logs'),
        T.bind('client', ({ logs }) =>
          makeClientWithTrigger({
            storage: () => ({
              onUploaded: (id) =>
                pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO),
            }),
          })
        ),
        T.chainFirst(({ client }) =>
          client.storage.upload({
            id: 'sakurazaka/kira',
            blob: stringToBlob('masumoto'),
          })
        ),
        T.chain(({ client }) => client.storage.download('sakurazaka/kira')),
        T.chain(getTextFromBlob)
      ),
      toStrictEqual: O.some('masumoto'),
    }),

    'can download inside trigger': test({
      expect: pipe(
        IORef.newIORef<readonly option.Option<string>[]>([]),
        T.fromIO,
        T.bindTo('logs'),
        T.bind('client', ({ logs }) =>
          makeClientWithTrigger({
            storage: (storageAdmin) => ({
              onUploaded: flow(
                storageAdmin.download,
                T.chain(getTextFromBlob),
                T.chain((text) =>
                  pipe(logs.read, IO.map(Array.append(text)), IO.chain(logs.write), T.fromIO)
                )
              ),
            }),
          })
        ),
        T.chainFirst(({ client }) =>
          client.storage.upload({
            id: 'sakurazaka/kira',
            blob: stringToBlob('masumoto'),
          })
        ),
        T.chain(({ logs }) => T.fromIO(logs.read))
      ),
      toStrictEqual: [O.some('masumoto')],
    }),
  },

  'Table DB': {
    'can set doc and get doc': test({
      expect: pipe(
        makeClientWithTrigger({}),
        T.bindTo('client'),
        T.chainFirst(({ client }) =>
          client.db.setDoc({
            key: { table: 'sakurazaka', id: 'kira' },
            data: { birthYear: 2002 },
          })
        ),
        T.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
      ),
      toStrictEqual: O.of({ birthYear: 2002 }),
    }),

    'returns empty option when getDoc non existing': test({
      expect: pipe(
        makeClientWithTrigger({}),
        T.bindTo('client'),
        T.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
      ),
      toStrictEqual: O.none,
    }),
  },
});
