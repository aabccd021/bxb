import { either, io, ioEither, ioOption, option, readonlyRecord } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Refinement } from 'fp-ts/Refinement';
import * as t from 'io-ts';

import type { DocKey, Stack } from '../type';
import type { Env, MockableWindow } from './type';

export const setItem = (getWindow: IO<MockableWindow>, key: string, value: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => win.localStorage.setItem(key, value))
  );

export const removeItem = (getWindow: IO<MockableWindow>, key: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => win.localStorage.removeItem(key))
  );

export const getItem = (getWindow: IO<MockableWindow>, key: string) =>
  pipe(
    getWindow,
    io.map((win) => win.localStorage.getItem(key)),
    io.map(option.fromNullable)
  );

export const getObjectItem = <T, K>(
  getWindow: IO<MockableWindow>,
  key: string,
  refinement: Refinement<unknown, T>,
  onFalse: (data: unknown) => K
) =>
  pipe(
    getItem(getWindow, key),
    ioOption.map(JSON.parse),
    ioOption.map(either.fromPredicate(refinement, onFalse)),
    io.map(option.match(() => either.right(option.none), either.map(option.some)))
  );

export const setObjectItem = <T>(getWindow: IO<MockableWindow>, key: string, data: T) =>
  pipe(data, JSON.stringify, (typeSafeData) => setItem(getWindow, key, typeSafeData));

const DB = t.record(t.string, t.record(t.string, t.unknown));

export const dbLocalStorageKey = 'db';

export const getDb = (getWindow: IO<MockableWindow>) =>
  getObjectItem(getWindow, dbLocalStorageKey, DB.is, (data) => ({
    code: 'ProviderError' as const,
    provider: 'mock',
    value: { message: 'invalid db data loaded', data },
  }));

export const stringifyDocKey = (key: DocKey) => `${key.collection}/${key.id}`;

export const validateGetDoc = (param: {
  readonly env: Env;
  readonly key: Pick<DocKey, 'collection'>;
}) =>
  pipe(
    param.env.dbDeployConfig.read,
    io.map(
      either.fromOption(() => ({
        code: 'ProviderError' as const,
        provider: 'mock',
        value: 'db deploy config not found',
      }))
    ),
    ioEither.chainEitherKW(
      either.fromPredicate(
        flow(
          readonlyRecord.lookup(param.key.collection),
          option.map((collectionConfig) => collectionConfig.securityRule?.get?.type === 'True'),
          option.getOrElse(() => false)
        ),
        () => ({ code: 'ForbiddenError' as const })
      )
    )
  );

export const notifySubscriberWithOnChanged = (param: {
  readonly env: Env;
  readonly key: Pick<DocKey, 'collection'>;
  readonly onChanged: Stack.client.db.OnSnapshot.OnChangedCallback;
  readonly docState: Stack.client.db.OnSnapshot.DocState;
}) =>
  pipe(
    validateGetDoc(param),
    ioEither.chainEitherK(() => param.docState),
    io.chainFirst(param.onChanged)
  );

export const notifySubscriber = (param: {
  readonly env: Env;
  readonly key: DocKey;
  readonly docState: Stack.client.db.OnSnapshot.DocState;
}) =>
  pipe(
    param.env.onDocChangedCallback.read,
    io.map(readonlyRecord.lookup(stringifyDocKey(param.key))),
    ioOption.chainIOK((onChanged) =>
      notifySubscriberWithOnChanged({
        env: param.env,
        key: param.key,
        onChanged,
        docState: param.docState,
      })
    )
  );
