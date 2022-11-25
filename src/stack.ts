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
import { IO } from 'fp-ts/IO';
import { IORef } from 'fp-ts/IORef';
import { Option } from 'fp-ts/Option';

import { mkFpLocation, mkFpWindow, mkSafeLocalStorage } from './mkFp';
import {
  CreateUserAndSignInWithEmailAndPasswordParam,
  DB,
  Env as _Env,
  GetDocParam,
  GetDownloadUrlError,
  GetDownloadUrlParam,
  OnAuthStateChangedParam,
  SetDocParam,
  UploadParam,
} from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

type ClientEnv = {
  readonly onAuthStateChangedCallback: IORef<Option<OnAuthStateChangedParam>>;
};

export const mkClientEnv: IO<ClientEnv> = pipe(
  ioRef.newIORef<Option<OnAuthStateChangedParam>>(option.none),
  io.map((onAuthStateChangedCallback) => ({
    onAuthStateChangedCallback,
  }))
);

type Env = _Env<ClientEnv>;

const authStorage = mkSafeLocalStorage(string.isString, (data) => ({
  message: 'invalid auth data loaded',
  data,
}))('auth');

const dbStorage = mkSafeLocalStorage(DB.type.is, (data, key) => ({
  code: 'ProviderError' as const,
  provider: 'mock',
  value: { message: 'invalid db data loaded', key, data },
}))('db');

export const stack = {
  ci: {
    deployStorage: () => task.of(undefined),
    deployDb: () => task.of(undefined),
  },
  client: {
    storage: {
      uploadDataUrl: (env: Env) => (param: UploadParam) =>
        pipe(
          env.browser.window,
          io.map(mkFpWindow),
          io.chain((win) => win.localStorage.setItem(`storage/${param.key}`, param.file)),
          taskEither.fromIO
        ),
      getDownloadUrl: (env: Env) => (param: GetDownloadUrlParam) =>
        pipe(
          env.browser.window,
          io.map(mkFpWindow),
          io.chain((win) => win.localStorage.getItem(`storage/${param.key}`)),
          io.map(either.fromOption(() => GetDownloadUrlError.Union.of.FileNotFound({}))),
          taskEither.fromIOEither
        ),
    },
    db: {
      setDoc: (env: Env) => (param: SetDocParam) =>
        pipe(
          env.browser.window,
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
      getDoc: (env: Env) => (param: GetDocParam) =>
        pipe(
          env.browser.window,
          io.map((win) => dbStorage(win.localStorage)),
          io.chain((storage) => storage.getItem),
          ioEither.map(
            option.chain(readonlyRecord.lookup(`${param.key.collection}/${param.key.id}`))
          ),
          taskEither.fromIOEither
        ),
    },
    auth: {
      signInWithGoogleRedirect: (env: Env) =>
        pipe(
          io.Do,
          io.bind('win', () => env.browser.window),
          io.let('location', ({ win }) => mkFpLocation(win.location)),
          io.bind('origin', ({ location }) => location.origin),
          io.bind('href', ({ location }) => location.href.get),
          io.chain(({ location, origin, href }) =>
            location.href.set(mkRedirectUrl({ origin, href }))
          )
        ),
      createUserAndSignInWithEmailAndPassword:
        (env: Env) => (param: CreateUserAndSignInWithEmailAndPasswordParam) =>
          pipe(
            env.browser.window,
            io.map((win) => authStorage(win.localStorage)),
            io.chain((storage) => storage.setItem(param.email)),
            io.chain(() => env.client.onAuthStateChangedCallback.read),
            ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.some(param.email)))
          ),
      onAuthStateChanged: (env: Env) => (param: OnAuthStateChangedParam) =>
        pipe(
          env.browser.window,
          io.map(mkFpWindow),
          io.chain((win) => win.localStorage.getItem('auth')),
          io.chain((lsAuth) => param(lsAuth)),
          io.chain(() => env.client.onAuthStateChangedCallback.write(option.some(param))),
          io.map(() => env.client.onAuthStateChangedCallback.write(option.none))
        ),
      signOut: (env: Env) =>
        pipe(
          env.browser.window,
          io.map(mkFpWindow),
          io.chain((win) => win.localStorage.removeItem('auth')),
          io.chain(() => env.client.onAuthStateChangedCallback.read),
          ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.none))
        ),
    },
  },
};
