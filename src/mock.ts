import { either, io, ioOption, ioRef, option, readonlyRecord, task, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';

import { mkFpWindow } from './mkFp';
import {
  Env,
  GetDocError,
  GetDownloadUrlError,
  OnAuthStateChangedCallback,
  Stack,
  UnknownRecord,
} from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

type ClientEnv = {};

const mkFpWinIo = io.map(mkFpWindow);

const signInWithRedirect = (env: Env<ClientEnv>) =>
  pipe(
    io.Do,
    io.bind('win', () => mkFpWinIo(env.browser.window)),
    io.bind('origin', ({ win }) => win.location.origin),
    io.bind('href', ({ win }) => win.location.href.get),
    io.chain(({ win, origin, href }) =>
      pipe({ origin, href }, mkRedirectUrl, win.location.href.set)
    )
  );

export const mkStack: IO<Stack<ClientEnv>> = pipe(
  io.Do,
  io.bind('onAuthStateChangedCallback', () =>
    ioRef.newIORef<Option<OnAuthStateChangedCallback>>(option.none)
  ),
  io.map(({ onAuthStateChangedCallback }) => ({
    ci: {
      deployStorage: () => task.of(undefined),
      deployDb: () => task.of(undefined),
    },
    client: {
      storage: {
        uploadBase64:
          ({ browser }) =>
          ({ key, file }) =>
            pipe(
              browser.window,
              mkFpWinIo,
              io.chain((win) => win.localStorage.setItem(`storage/${key}`, file)),
              task.fromIO
            ),
        getDownloadUrl:
          ({ browser }) =>
          ({ key }) =>
            pipe(
              browser.window,
              mkFpWinIo,
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
              io.Do,
              io.bind('win', () => mkFpWinIo(env.browser.window)),
              io.bind('oldDbData', ({ win }) => win.localStorage.getItem('db')),
              io.chain(({ win, oldDbData }) =>
                pipe(
                  oldDbData,
                  option.map(JSON.parse),
                  option.chain(option.fromPredicate(UnknownRecord.type.is)),
                  option.getOrElse(() => ({})),
                  (dbData) => ({
                    ...dbData,
                    [`${key.collection}/${key.id}`]: data,
                  }),
                  (r: UnknownRecord) => JSON.stringify(r),
                  (updatedDbData) => win.localStorage.setItem('db', updatedDbData)
                )
              ),
              task.fromIO
            ),
        getDoc:
          (env) =>
          ({ key }) =>
            pipe(
              mkFpWinIo(env.browser.window),
              io.chain((win) => win.localStorage.getItem('db')),
              io.map(
                flow(
                  either.fromOption(() => GetDocError.Union.of.DocNotFound({})),
                  either.chainW(
                    flow(
                      JSON.parse,
                      option.fromPredicate(UnknownRecord.type.is),
                      either.fromOption(() =>
                        GetDocError.Union.of.Unknown({ value: 'db is not an object' })
                      )
                    )
                  ),
                  either.chainW(
                    flow(
                      readonlyRecord.lookup(`${key.collection}/${key.id}`),
                      either.fromOption(() => GetDocError.Union.of.DocNotFound({}))
                    )
                  ),
                  either.chainW(
                    flow(
                      option.fromPredicate(UnknownRecord.type.is),
                      either.fromOption(() =>
                        GetDocError.Union.of.Unknown({ value: 'doc is not an object' })
                      )
                    )
                  )
                )
              ),
              taskEither.fromIOEither
            ),
      },
      auth: {
        signInWithGoogleRedirect: signInWithRedirect,
        createUserAndSignInWithEmailAndPassword: (env) => (email, _password) =>
          pipe(
            io.Do,
            io.chain(() => mkFpWinIo(env.browser.window)),
            io.chainFirst((win) => win.localStorage.setItem('auth', email)),
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.some(email)))
          ),
        onAuthStateChanged: (env) => (onChangedCallback) =>
          pipe(
            io.Do,
            io.bind('win', () => mkFpWinIo(env.browser.window)),
            io.chainFirst(() => onAuthStateChangedCallback.write(option.some(onChangedCallback))),
            io.bind('lsAuth', ({ win }) => win.localStorage.getItem('auth')),
            io.chainFirst(({ lsAuth }) => onChangedCallback(lsAuth)),
            io.map(() => onAuthStateChangedCallback.write(option.none))
          ),
        signOut: (env) =>
          pipe(
            io.Do,
            io.chain(() => mkFpWinIo(env.browser.window)),
            io.chainFirst((win) => win.localStorage.removeItem('auth')),
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.none))
          ),
      },
    },
  }))
);
