import {
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
import validDataUrl from 'valid-data-url';

import { mkFpLocation, mkFpWindow, mkSafeLocalStorage } from './mkFp';
import type { Client, OnAuthStateChangedParam, Stack } from './type';
import { UploadDataUrlError } from './type';
import { DB, GetDownloadUrlError } from './type';

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
};

export type MockProviderClient = {
  readonly env: MockClientEnv;
  readonly config: unknown;
};

export type MockProvider = {
  readonly client: MockProviderClient;
};

export const mkClientEnv: IO<MockClientEnv> = pipe(
  ioRef.newIORef<Option<OnAuthStateChangedParam>>(option.none),
  io.map((onAuthStateChangedCallback) => ({
    onAuthStateChangedCallback,
  }))
);

const client: Client<MockProviderClient> = {
  storage: {
    uploadDataUrl: (ctx) => (param) =>
      pipe(
        param.dataUrl,
        either.fromPredicate(validDataUrl, () =>
          UploadDataUrlError.Union.of.InvalidDataUrlFormat({})
        ),
        ioEither.fromEither,
        ioEither.chainIOK(() => ctx.browser.getWindow),
        ioEither.map(mkFpWindow),
        ioEither.chainIOK((win) => win.localStorage.setItem(`storage/${param.key}`, param.dataUrl)),
        taskEither.fromIOEither
      ),
    getDownloadUrl: (ctx) => (param) =>
      pipe(
        ctx.browser.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.getItem(`storage/${param.key}`)),
        io.map(either.fromOption(() => GetDownloadUrlError.Union.of.FileNotFound({}))),
        taskEither.fromIOEither
      ),
  },
  db: {
    setDoc: (ctx) => (param) =>
      pipe(
        ctx.browser.getWindow,
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
    getDoc: (ctx) => (param) =>
      pipe(
        ctx.browser.getWindow,
        io.map((win) => dbStorage(win.localStorage)),
        io.chain((storage) => storage.getItem),
        ioEither.map(
          option.chain(readonlyRecord.lookup(`${param.key.collection}/${param.key.id}`))
        ),
        taskEither.fromIOEither
      ),
  },
  auth: {
    signInWithGoogleRedirect: (ctx) =>
      pipe(
        io.Do,
        io.bind('win', () => ctx.browser.getWindow),
        io.let('location', ({ win }) => mkFpLocation(win.location)),
        io.bind('origin', ({ location }) => location.origin),
        io.bind('href', ({ location }) => location.href.get),
        io.chain(({ location, origin, href }) => location.href.set(mkRedirectUrl({ origin, href })))
      ),
    createUserAndSignInWithEmailAndPassword: (ctx) => (param) =>
      pipe(
        ctx.browser.getWindow,
        io.map((win) => authStorage(win.localStorage)),
        io.chain((storage) => storage.setItem(param.email)),
        io.chain(() => ctx.env.onAuthStateChangedCallback.read),
        ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.some(param.email)))
      ),
    onAuthStateChanged: (ctx) => (onChangedCallback) =>
      pipe(
        ctx.browser.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.getItem('auth')),
        io.chain((lsAuth) => onChangedCallback(lsAuth)),
        io.chain(() => ctx.env.onAuthStateChangedCallback.write(option.some(onChangedCallback))),
        io.map(() => ctx.env.onAuthStateChangedCallback.write(option.none))
      ),
    signOut: (ctx) =>
      pipe(
        ctx.browser.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.removeItem('auth')),
        io.chain(() => ctx.env.onAuthStateChangedCallback.read),
        ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.none))
      ),
  },
};

export const stack: Stack<MockProvider> = {
  ci: {
    deployStorage: () => task.of(undefined),
    deployDb: () => task.of(undefined),
  },
  client,
};
