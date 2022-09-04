import { io, ioRef, option, readonlyArray, task, taskOption } from 'fp-ts';
import { constant, flow, pipe } from 'fp-ts/function';
import { expect as expect_, it as it__ } from 'vitest';

import { MakeClient } from '../src';

export const getTextFromBlob =
  (downloadResult: Blob): task.Task<option.Option<string>> =>
  () =>
    downloadResult.text().then(option.fromNullable);

export const stringToBlob = (text: string) => new Blob([text]);

export type Test<T = unknown> = {
  readonly expect: task.Task<T>;
  readonly toEqual: T;
};

export type TestType = 'pass' | 'fail' | 'skip';

export type WrappedTest<T = unknown> = {
  readonly type: TestType;
  readonly test: Test<T>;
};

export const pass = <T>(test: Test<T>): WrappedTest<T> => ({ type: 'pass', test });

export const fail = <T>(test: Test<T>): WrappedTest<T> => ({ type: 'fail', test });

export const skip = <T>(test: Test<T>): WrappedTest<T> => ({ type: 'skip', test });

export type Tests = Record<string, WrappedTest>;

const it_ = (name: string, t: task.Task<void>) => constant(it__(name, t));

const fails_ = (name: string, t: task.Task<void>) => constant(it__.fails(name, t));

const skip_ = (name: string, t: task.Task<void>) => constant(it__.skip(name, t));

const getTesterByType = (type: TestType) =>
  type === 'pass' ? it_ : type === 'fail' ? fails_ : skip_;

export const runTests = (tests: Tests) =>
  Object.entries(tests).map(
    ([
      testName,
      {
        type,
        test: { expect: actual, toEqual: expected },
      },
    ]) => getTesterByType(type)(testName, () => expect_(actual()).resolves.toStrictEqual(expected))
  );

export const makeTest = (makeClient: MakeClient): Tests => ({
  'can upload and download': pass({
    expect: pipe(
      task.Do,
      task.bind('client', () => makeClient({})),
      task.chainFirst(({ client }) =>
        client.storage.upload({
          id: 'sakurazaka/kira',
          blob: stringToBlob('masumoto'),
        })
      ),
      task.chain(({ client }) => client.storage.download('sakurazaka/kira')),
      taskOption.chain(getTextFromBlob)
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
          blob: stringToBlob('masumoto'),
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
          blob: stringToBlob('masumoto'),
        })
      ),
      task.chain(({ client }) => client.storage.download('sakurazaka/kira')),
      taskOption.chain(getTextFromBlob)
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
              taskOption.chain(getTextFromBlob),
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
