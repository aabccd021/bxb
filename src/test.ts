/* eslint-disable functional/no-expression-statement */
import { option, task } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import * as O from 'fp-ts/Option';
import * as Array from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';
import { describe, expect, it } from 'vitest';

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

const taskStrictEqual = <Result>(name: string, actual: task.Task<Result>, expected: Result) =>
  it(name, () => expect(actual()).resolves.toStrictEqual(expected));

export const test = (makeClientWithTrigger: MakeClientWithConfig) => {
  describe.concurrent('Storage', () => {
    taskStrictEqual(
      'can upload and download',
      pipe(
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
      O.some('masumoto')
    );

    taskStrictEqual(
      'can run trigger when object uploaded',
      pipe(
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
      ['sakurazaka/kira']
    );

    taskStrictEqual(
      'still upload when having trigger',
      pipe(
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
      O.some('masumoto')
    );

    taskStrictEqual(
      'can download inside trigger',
      pipe(
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
      [O.some('masumoto')]
    );
  });

  describe.concurrent('Table DB', () => {
    taskStrictEqual(
      'can set doc and get doc',
      pipe(
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
      O.of({ birthYear: 2002 })
    );

    taskStrictEqual(
      'returns empty option when getDoc non existing',
      pipe(
        makeClientWithTrigger({}),
        T.bindTo('client'),
        T.chain(({ client }) => client.db.getDoc({ id: 'kira', table: 'sakurazaka' }))
      ),
      O.none
    );
  });
};
