/* eslint-disable functional/no-expression-statement */
import * as IO from 'fp-ts/IO';
import * as IORef from 'fp-ts/IORef';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as Array from 'fp-ts/ReadonlyArray';
import * as T from 'fp-ts/Task';
import { make } from 'make-struct-ts';
import { describe, expect, it } from 'vitest';

import { FileSnapshot, MakeClientWithTrigger } from '../src';

export const getTextFromBlob = async (downloadResult: O.Option<Blob>) => {
  const donwloadResultBlob: Blob | undefined = pipe(
    downloadResult,
    O.getOrElse<Blob | undefined>(() => undefined)
  );
  const downloadResultText = await donwloadResultBlob?.text();
  return downloadResultText;
};

export const stringToBlob = (text: string) => new Blob([text]);

export const test = (makeClientWithTrigger: MakeClientWithTrigger) => {
  describe.concurrent('Storage', () => {
    it('can upload and download', async () => {
      const makeClient = makeClientWithTrigger({});
      const client = makeClient();

      const upload = pipe(
        'masumoto',
        stringToBlob,
        make(FileSnapshot).blob({ id: 'sakurazaka/kira' }),
        client.storage.upload
      );
      await upload();

      const download = client.storage.download('sakurazaka/kira');
      const result = await download().then(getTextFromBlob);
      expect(result).toStrictEqual('masumoto');
    });

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

      const download = client.storage.download('sakurazaka/kira');
      const result = await download().then(getTextFromBlob);
      expect(result).toStrictEqual('masumoto');
    });

    it('can use storage inside trigger', async () => {
      const makeClient = makeClientWithTrigger({
        storage: (admin) => ({
          onUploaded: (id) =>
            id === 'sakurazaka/kira'
              ? pipe(
                  'nanakusa',
                  stringToBlob,
                  make(FileSnapshot).blob({ id: 'yofukashi/nazuna' }),
                  admin.storage.upload
                )
              : T.Do,
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

      const downloadNazuna = client.storage.download('yofukashi/nazuna');
      const nazunaResult = await downloadNazuna().then(getTextFromBlob);
      expect(nazunaResult).toStrictEqual('nanakusa');
    });
  });

  describe.concurrent('Table DB', () => {
    it('can set doc and get doc', async () => {
      const makeClient = makeClientWithTrigger({});
      const client = makeClient();

      const setDoc = client.db.setDoc({
        key: { table: 'sakurazaka', id: 'kira' },
        data: { birthYear: 2002 },
      });
      await setDoc();

      const getDoc = client.db.getDoc({ table: 'sakurazaka', id: 'kira' });
      const result = await getDoc();
      expect(result).toStrictEqual(O.of({ birthYear: 2002 }));
    });

    it('returns empty option when getDoc non existing ', async () => {
      const makeClient = makeClientWithTrigger({});
      const client = makeClient();

      const getDoc = client.db.getDoc({ table: 'sakurazaka', id: 'kira' });
      const result = await getDoc();
      expect(result).toStrictEqual(O.none);
    });
  });

  describe.concurrent('Combination', () => {
    it('can set doc on upload', async () => {
      const makeClient = makeClientWithTrigger({
        storage: (admin) => ({
          onUploaded: (id) =>
            admin.db.setDoc({
              key: { table: 'imageUploaded', id: '1' },
              data: { id },
            }),
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

      const getDoc = client.db.getDoc({ table: 'imageUploaded', id: '1' });
      const result = await getDoc();
      expect(result).toStrictEqual(O.of({ id: 'sakurazaka/kira' }));
    });
  });
};
