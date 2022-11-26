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
import validDataUrl from 'valid-data-url';

import { mkFpLocation, mkFpWindow, mkSafeLocalStorage } from './mkFp';
import type { Client, OnAuthStateChangedParam, Stack, Window } from './type';
import { DB, GetDownloadUrlError, UploadDataUrlError } from './type';

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

const client: Client<MockClientEnv> = {
  storage: {
    uploadDataUrl: (env) => (param) =>
      pipe(
        param.dataUrl,
        either.fromPredicate(validDataUrl, () =>
          UploadDataUrlError.Union.of.InvalidDataUrlFormat({})
        ),
        ioEither.fromEither,
        ioEither.chainIOK(() => env.getWindow),
        ioEither.map(mkFpWindow),
        ioEither.chainIOK((win) => win.localStorage.setItem(`storage/${param.key}`, param.dataUrl)),
        taskEither.fromIOEither
      ),
    getDownloadUrl: (env) => (param) =>
      pipe(
        env.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.getItem(`storage/${param.key}`)),
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
        env.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.getItem('auth')),
        io.chain((lsAuth) => onChangedCallback(lsAuth)),
        io.chain(() => env.onAuthStateChangedCallback.write(option.some(onChangedCallback))),
        io.map(() => env.onAuthStateChangedCallback.write(option.none))
      ),
    signOut: (env) =>
      pipe(
        env.getWindow,
        io.map(mkFpWindow),
        io.chain((win) => win.localStorage.removeItem('auth')),
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
