import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import type { AType } from '@morphic-ts/summoners/lib';
import {
  apply,
  either,
  io,
  ioEither,
  ioOption,
  ioRef,
  option,
  readonlyRecord,
  string,
  task,
  taskEither,
} from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { IORef } from 'fp-ts/IORef';
import type { Option } from 'fp-ts/Option';
import type { Refinement } from 'fp-ts/Refinement';
import type { DeepPick } from 'ts-essentials';
import validDataUrl from 'valid-data-url';

import type { Client, OnAuthStateChangedParam, Stack } from './type';
import { GetDownloadUrlError, UploadDataUrlError } from './type';

const { summon } = summonFor({});

export type Window = DeepPick<
  typeof window,
  {
    readonly location: {
      readonly origin: never;
      readonly href: never;
    };
    readonly localStorage: never;
  }
>;

export const DB = summon((F) => F.strMap(F.strMap(F.unknown())));

export type DB = AType<typeof DB>;

const mkFpLocalStorage = (localStorage: Window['localStorage']) => ({
  getItem: (key: string) => pipe(() => localStorage.getItem(key), io.map(option.fromNullable)),
  // eslint-disable-next-line functional/no-return-void
  setItem: (key: string, value: string) => () => localStorage.setItem(key, value),
  // eslint-disable-next-line functional/no-return-void
  removeItem: (key: string) => () => localStorage.removeItem(key),
});

const mkFpLocation = (location: Window['location']) => ({
  origin: () => location.origin,
  href: {
    get: () => location.href,
    // eslint-disable-next-line functional/no-return-void
    set: (newHref: string) => () => {
      // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
      location.href = newHref;
    },
  },
});

const mkSafeLocalStorage =
  <T, K>(refinement: Refinement<unknown, T>, onFalse: (data: unknown, key: string) => K) =>
  (key: string) =>
    flow(mkFpLocalStorage, (localStorage) => ({
      setItem: (data: T) =>
        pipe(data, JSON.stringify, (typeSafeData) => localStorage.setItem(key, typeSafeData)),
      getItem: pipe(
        localStorage.getItem(key),
        ioOption.map(JSON.parse),
        ioOption.map(either.fromPredicate(refinement, (data) => onFalse(data, key))),
        io.map(option.match(() => either.right(option.none), either.map(option.some)))
      ),
    }));

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

const authStorage = mkSafeLocalStorage(string.isString, (data) => ({
  message: 'invalid auth data loaded',
  data,
}))('auth');

const dbStorage = mkSafeLocalStorage(DB.type.is, (data, key) => ({
  code: 'ProviderError' as const,
  provider: 'mock',
  value: { message: 'invalid db data loaded', key, data },
}))('db');

export type MockClientEnv = {
  readonly onAuthStateChangedCallback: IORef<Option<OnAuthStateChangedParam>>;
  readonly getWindow: IO<Window>;
};

export const mkClientEnvFromWindow = (getGetWindow: IO<IO<Window>>) =>
  apply.sequenceS(io.Apply)({
    onAuthStateChangedCallback: ioRef.newIORef<Option<OnAuthStateChangedParam>>(option.none),
    getWindow: getGetWindow,
  });

export const mkClientEnv = mkClientEnvFromWindow(() => () => window);

const fpLocalStorageFromEnv = (env: MockClientEnv) =>
  pipe(
    env.getWindow,
    io.map((win) => mkFpLocalStorage(win.localStorage))
  );

const client: Client<MockClientEnv> = {
  storage: {
    uploadDataUrl: (env) => (param) =>
      pipe(
        param.dataUrl,
        either.fromPredicate(validDataUrl, () =>
          UploadDataUrlError.Union.of.InvalidDataUrlFormat({})
        ),
        ioEither.fromEither,
        ioEither.chainIOK((vlidDataUrl) =>
          pipe(
            fpLocalStorageFromEnv(env),
            io.chain((localStorage) => localStorage.setItem(`storage/${param.key}`, vlidDataUrl))
          )
        ),
        taskEither.fromIOEither
      ),
    getDownloadUrl: (env) => (param) =>
      pipe(
        fpLocalStorageFromEnv(env),
        io.chain((localStorage) => localStorage.getItem(`storage/${param.key}`)),
        io.map(either.fromOption(() => GetDownloadUrlError.Union.of.FileNotFound({}))),
        taskEither.fromIOEither
      ),
  },
  db: {
    setDoc: (env) => (param) =>
      pipe(
        env.getWindow,
        io.map((win) => dbStorage(win.localStorage)),
        io.chain((storage) =>
          pipe(
            storage.getItem,
            ioEither.map(
              flow(
                option.getOrElse(() => ({})),
                readonlyRecord.upsertAt(`${param.key.collection}/${param.key.id}`, param.data)
              )
            ),
            ioEither.chainIOK(storage.setItem)
          )
        ),
        taskEither.fromIOEither
      ),
    getDoc: (env) => (param) =>
      pipe(
        env.getWindow,
        io.map((win) => dbStorage(win.localStorage)),
        io.chain((storage) => storage.getItem),
        ioEither.map(
          option.chain(readonlyRecord.lookup(`${param.key.collection}/${param.key.id}`))
        ),
        taskEither.fromIOEither
      ),
  },
  auth: {
    signInWithGoogleRedirect: (env) =>
      pipe(
        io.Do,
        io.bind('win', () => env.getWindow),
        io.let('location', ({ win }) => mkFpLocation(win.location)),
        io.bind('origin', ({ location }) => location.origin),
        io.bind('href', ({ location }) => location.href.get),
        io.chain(({ location, origin, href }) => location.href.set(mkRedirectUrl({ origin, href })))
      ),
    createUserAndSignInWithEmailAndPassword: (env) => (param) =>
      pipe(
        env.getWindow,
        io.map((win) => authStorage(win.localStorage)),
        io.chain((storage) => storage.setItem(param.email)),
        io.chain(() => env.onAuthStateChangedCallback.read),
        ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.some(param.email)))
      ),
    onAuthStateChanged: (env) => (onChangedCallback) =>
      pipe(
        fpLocalStorageFromEnv(env),
        io.chain((localStorage) => localStorage.getItem('auth')),
        io.chain((lsAuth) => onChangedCallback(lsAuth)),
        io.chain(() => env.onAuthStateChangedCallback.write(option.some(onChangedCallback))),
        io.map(() => env.onAuthStateChangedCallback.write(option.none))
      ),
    signOut: (env) =>
      pipe(
        fpLocalStorageFromEnv(env),
        io.chain((localStorage) => localStorage.removeItem('auth')),
        io.chain(() => env.onAuthStateChangedCallback.read),
        ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.none))
      ),
  },
};

export const stack: Stack<MockClientEnv> = {
  ci: {
    deployStorage: () => task.of(undefined),
    deployDb: () => task.of(undefined),
  },
  client,
};
