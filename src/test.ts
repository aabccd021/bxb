/* eslint-disable functional/no-expression-statement */
import { flow, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import * as O from 'fp-ts/Option';
import { Option } from 'fp-ts/Option';
import * as Array from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';
import { Task } from 'fp-ts/Task';
import { make } from 'make-struct-ts';
import { describe, expect, it } from 'vitest';

import { DocKey, DocSnapshot, FileSnapshot, MakeClientWithConfig } from '../src';

export const getTextFromBlob =
  (downloadResult: Option<Blob>): Task<Option<string>> =>
  async () => {
    const donwloadResultBlob: Blob | undefined = pipe(
      downloadResult,
      O.getOrElse<Blob | undefined>(() => undefined)
    );
    const downloadResultText = await donwloadResultBlob?.text();
    return O.fromNullable(downloadResultText);
  };

export const stringToBlob = (text: string) => new Blob([text]);

const taskStrictEqual = <Result>(name: string, actual: Task<Result>, expected: Result) =>
  it(name, () => expect(actual()).resolves.toStrictEqual(expected));

export const test = (makeClientWithTrigger: MakeClientWithConfig) => {
  describe.concurrent('Storage', () => {
    taskStrictEqual(
      'can upload and download',
      pipe(
        makeClientWithTrigger({}),
        T.fromIO,
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

    it('can run trigger when object uploaded', async () => {
      const logs = IORef.newIORef<readonly string[]>([])();
      const makeClient = makeClientWithTrigger({
        storage: () => ({
          onUploaded: (id) =>
            pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO),
        }),
      });
      const client = makeClient();

      const upload = pipe(
        'masumoto',
        stringToBlob,
        make(FileSnapshot).blob({ id: 'sakurazaka/kira' }),
        client.storage.upload
      );
      await upload();

      expect(logs.read()).toStrictEqual(['sakurazaka/kira']);
    });

    it('still upload when having trigger', async () => {
      const logs = IORef.newIORef<readonly string[]>([])();
      const appendLog = (id: string) =>
        pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO);
      const makeClient = makeClientWithTrigger({
        storage: () => ({
          onUploaded: appendLog,
        }),
      });
      const client = makeClient();

      const upload = pipe(
        'masumoto',
        stringToBlob,
        make(FileSnapshot).blob({ id: 'sakurazaka/kira' }),
        client.storage.upload
      );
      await upload();

      const download = pipe('sakurazaka/kira', client.storage.download, T.chain(getTextFromBlob));
      const result = await download();
      expect(result).toStrictEqual(O.some('masumoto'));
    });

    it('can download inside trigger', async () => {
      const logs = IORef.newIORef<readonly Option<string>[]>([])();
      const appendLog = (id: Option<string>) =>
        pipe(logs.read, IO.map(Array.append(id)), IO.chain(logs.write), T.fromIO);
      const makeClient = makeClientWithTrigger({
        storage: (storageAdmin) => ({
          onUploaded: flow(storageAdmin.download, T.chain(getTextFromBlob), T.chain(appendLog)),
        }),
      });
      const client = makeClient();

      const upload = pipe(
        'masumoto',
        stringToBlob,
        make(FileSnapshot).blob({ id: 'sakurazaka/kira' }),
        client.storage.upload
      );
      await upload();

      expect(logs.read()).toStrictEqual([O.some('masumoto')]);
    });
  });

  describe.concurrent('Table DB', () => {
    it('can set doc and get doc', async () => {
      const makeClient = makeClientWithTrigger({});
      const client = makeClient();

      const setDoc = pipe(
        'kira',
        make(DocKey).id({ table: 'sakurazaka' }),
        make(DocSnapshot).key({ data: { birthYear: 2002 } }),
        client.db.setDoc
      );
      await setDoc();

      const getDoc = pipe('kira', make(DocKey).id({ table: 'sakurazaka' }), client.db.getDoc);
      const result = await getDoc();
      expect(result).toStrictEqual(O.of({ birthYear: 2002 }));
    });

    it('returns empty option when getDoc non existing ', async () => {
      const makeClient = makeClientWithTrigger({});
      const client = makeClient();

      const getDoc = pipe('kira', make(DocKey).id({ table: 'sakurazaka' }), client.db.getDoc);
      const result = await getDoc();
      expect(result).toStrictEqual(O.none);
    });
  });
};
