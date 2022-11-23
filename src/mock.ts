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
import { Option } from 'fp-ts/Option';

import { mkFpLocation, mkFpWindow, mkSafeLocalStorage } from './mkFp';
import {
  DB,
  Env,
  GetDocError,
  GetDownloadUrlError,
  OnAuthStateChangedCallback,
  Stack,
} from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

type ClientEnv = {};

const signInWithRedirect = (env: Env<ClientEnv>) =>
  pipe(
    io.Do,
    io.bind('win', () => env.browser.window),
    io.let('location', ({ win }) => mkFpLocation(win.location)),
    io.bind('origin', ({ location }) => location.origin),
    io.bind('href', ({ location }) => location.href.get),
    io.chain(({ location, origin, href }) => location.href.set(mkRedirectUrl({ origin, href })))
  );

const authStorage = mkSafeLocalStorage(string.isString, (data) => ({
  message: 'invalid auth data loaded',
  data,
}))('auth');

const dbStorage = mkSafeLocalStorage(DB.type.is, (data, key) =>
  GetDocError.Union.of.Unknown({ value: { message: 'invalid db data loaded', key, data } })
)('db');

export const mkStack: IO<Stack<ClientEnv>> = pipe(
  ioRef.newIORef<Option<OnAuthStateChangedCallback>>(option.none),
  io.map((onAuthStateChangedCallback) => ({
    ci: {
      deployStorage: () => task.of(undefined),
      deployDb: () => task.of(undefined),
    },
    client: {
      storage: {
        uploadDataUrl:
          ({ browser }) =>
          ({ key, file }) =>
            pipe(
              browser.window,
              io.map(mkFpWindow),
              io.chain((win) => win.localStorage.setItem(`storage/${key}`, file)),
              task.fromIO
            ),
        getDownloadUrl:
          ({ browser }) =>
          ({ key }) =>
            pipe(
              browser.window,
              io.map(mkFpWindow),
              io.chain((win) => win.localStorage.getItem(`storage/${key}`)),
              io.map(either.fromOption(() => GetDownloadUrlError.Union.of.FileNotFound({}))),
              taskEither.fromIOEither
            ),
      },
      db: {
        setDoc:
          (env) =>
          ({ key, data }) =>
            pipe(
              env.browser.window,
              io.map((win) => dbStorage(win.localStorage)),
              io.chain((storage) =>
                pipe(
                  storage.getItem,
                  ioEither.map(
                    flow(
                      option.getOrElse(() => ({})),
                      readonlyRecord.upsertAt(`${key.collection}/${key.id}`, data)
                    )
                  ),
                  ioEither.chainIOK(storage.setItem)
                )
              ),
              taskEither.fromIOEither
            ),
        getDoc:
          (env) =>
          ({ key }) =>
            pipe(
              env.browser.window,
              io.map((win) => dbStorage(win.localStorage)),
              io.chain((storage) => storage.getItem),
              ioEither.chainEitherK(
                flow(
                  option.chain(readonlyRecord.lookup(`${key.collection}/${key.id}`)),
                  either.fromOption(() => GetDocError.Union.of.DocNotFound({}))
                )
              ),
              taskEither.fromIOEither
            ),
      },
      auth: {
        signInWithGoogleRedirect: signInWithRedirect,
        createUserAndSignInWithEmailAndPassword: (env) => (email, _password) =>
          pipe(
            env.browser.window,
            io.map((win) => authStorage(win.localStorage)),
            io.chain((storage) => storage.setItem(email)),
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.some(email)))
          ),
        onAuthStateChanged: (env) => (onChangedCallback) =>
          pipe(
            env.browser.window,
            io.map(mkFpWindow),
            io.chain((win) => win.localStorage.getItem('auth')),
            io.chain((lsAuth) => onChangedCallback(lsAuth)),
            io.chain(() => onAuthStateChangedCallback.write(option.some(onChangedCallback))),
            io.map(() => onAuthStateChangedCallback.write(option.none))
          ),
        signOut: (env) =>
          pipe(
            env.browser.window,
            io.map(mkFpWindow),
            io.chain((win) => win.localStorage.removeItem('auth')),
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.none))
          ),
      },
    },
  }))
);
