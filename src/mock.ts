import { io, ioOption, ioRef, option, task, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';

import { mkFpWindow } from './mkFp';
import { FpWindow, OnAuthStateChangedCallback, Stack } from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

const signInWithRedirect = (window: FpWindow) =>
  pipe(
    io.Do,
    io.bind('origin', () => window.location.origin),
    io.bind('href', () => window.location.href.get),
    io.map(mkRedirectUrl),
    io.chain(window.location.href.set)
  );

export const mkStackFromDom = (mkWindow: IO<typeof window>): IO<Stack> => {
  const window = mkFpWindow(mkWindow);
  return pipe(
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
          uploadBase64: () => task.of(undefined),
          getDownloadUrl: () => taskEither.of(''),
        },
        db: {
          setDoc: () => task.of(undefined),
          getDoc: () => taskEither.of({}),
        },
        auth: {
          signInWithGoogleRedirect: signInWithRedirect(window),
          createUserAndSignInWithEmailAndPassword: (email, _password) =>
            pipe(
              io.Do,
              io.chain(() => onAuthStateChangedCallback.read),
              ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.some(email))),
              io.chainFirst(() => window.localStorage.setItem('auth', email))
            ),
          onAuthStateChanged: (onChangedCallback) =>
            pipe(
              io.Do,
              io.chainFirst(() => onAuthStateChangedCallback.write(option.some(onChangedCallback))),
              io.bind('lsAuth', () => window.localStorage.getItem('auth')),
              io.chainFirst(({ lsAuth }) => onChangedCallback(lsAuth)),
              io.map(() => onAuthStateChangedCallback.write(option.none))
            ),
          signOut: pipe(
            io.Do,
            io.chain(() => onAuthStateChangedCallback.read),
            ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.none)),
            io.chainFirst(() => window.localStorage.removeItem('auth'))
          ),
        },
      },
    }))
  );
};
