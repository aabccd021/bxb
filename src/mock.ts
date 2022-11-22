import { either, io, ioOption, ioRef, option, task, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';

import { mkFpWindow } from './mkFp';
import { FpWindow, GetDownloadUrlError, OnAuthStateChangedCallback, Stack } from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

const signInWithRedirect = (win: FpWindow) =>
  pipe(
    io.Do,
    io.bind('origin', () => win.location.origin),
    io.bind('href', () => win.location.href.get),
    io.map(mkRedirectUrl),
    io.chain(win.location.href.set)
  );

export const mkStackFromWindow = (mkWindow: IO<typeof window>): IO<Stack> =>
  pipe(
    io.Do,
    io.bind('onAuthStateChangedCallback', () =>
      ioRef.newIORef<Option<OnAuthStateChangedCallback>>(option.none)
    ),
    io.bind('win', () => io.map(mkFpWindow)(mkWindow)),
    io.map(({ onAuthStateChangedCallback, win }) => ({
      ci: {
        deployStorage: () => task.of(undefined),
        deployDb: () => task.of(undefined),
      },
      client: {
        storage: {
          uploadBase64: ({ key, file }) =>
            task.fromIO(win.localStorage.setItem(`storage/${key}`, file)),
          getDownloadUrl: ({ key }) =>
            pipe(
              win.localStorage.getItem(`storage/${key}`),
              io.map(either.fromOption(() => GetDownloadUrlError.Union.of.FileNotFound({}))),
              taskEither.fromIOEither
            ),
        },
        db: {
          setDoc: () => task.of(undefined),
          getDoc: () => taskEither.of({}),
        },
        auth: {
          signInWithGoogleRedirect: signInWithRedirect(win),
          createUserAndSignInWithEmailAndPassword: (email, _password) =>
            pipe(
              io.Do,
              io.chain(() => onAuthStateChangedCallback.read),
              ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.some(email))),
              io.chainFirst(() => win.localStorage.setItem('auth', email))
            ),
          onAuthStateChanged: (onChangedCallback) =>
            pipe(
              io.Do,
              io.chainFirst(() => onAuthStateChangedCallback.write(option.some(onChangedCallback))),
              io.bind('lsAuth', () => win.localStorage.getItem('auth')),
              io.chainFirst(({ lsAuth }) => onChangedCallback(lsAuth)),
              io.map(() => onAuthStateChangedCallback.write(option.none))
            ),
          signOut: pipe(
            io.Do,
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.none)),
            io.chainFirst(() => win.localStorage.removeItem('auth'))
          ),
        },
      },
    }))
  );
