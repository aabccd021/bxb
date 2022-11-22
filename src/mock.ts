import { either, io, ioOption, ioRef, option, task, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';

import { mkFpWindow } from './mkFp';
import { Env, GetDownloadUrlError, OnAuthStateChangedCallback, Stack } from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

type ClientEnv = {};

const signInWithRedirect = (env: Env<ClientEnv>) =>
  pipe(
    io.Do,
    io.bind('win', () => io.map(mkFpWindow)(env.browser.window)),
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
        setDoc: () => () => task.of(undefined),
        getDoc: () => () => taskEither.of({}),
      },
      auth: {
        signInWithGoogleRedirect: signInWithRedirect,
        createUserAndSignInWithEmailAndPassword: (env) => (email, _password) =>
          pipe(
            io.Do,
            io.chain(() => io.map(mkFpWindow)(env.browser.window)),
            io.chainFirst((win) => win.localStorage.setItem('auth', email)),
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.some(email)))
          ),
        onAuthStateChanged: (env) => (onChangedCallback) =>
          pipe(
            io.Do,
            io.bind('win', () => io.map(mkFpWindow)(env.browser.window)),
            io.chainFirst(() => onAuthStateChangedCallback.write(option.some(onChangedCallback))),
            io.bind('lsAuth', ({ win }) => win.localStorage.getItem('auth')),
            io.chainFirst(({ lsAuth }) => onChangedCallback(lsAuth)),
            io.map(() => onAuthStateChangedCallback.write(option.none))
          ),
        signOut: (env) =>
          pipe(
            io.Do,
            io.chain(() => io.map(mkFpWindow)(env.browser.window)),
            io.chainFirst((win) => win.localStorage.removeItem('auth')),
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.none))
          ),
      },
    },
  }))
);
