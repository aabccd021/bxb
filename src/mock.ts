import { io, ioOption, ioRef, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';

import { FpDOM, OnAuthStateChangedCallback, Stack } from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

const signInWithRedirect = (dom: FpDOM) =>
  pipe(
    io.Do,
    io.bind('origin', () => dom.window.location.origin),
    io.bind('href', () => dom.window.location.href.get),
    io.map(mkRedirectUrl),
    io.chain(dom.window.location.href.set)
  );

export const mkStackFromFpDom = (
  dom: FpDOM
): IO<
  Pick<
    Stack,
    | 'signInGoogleWithRedirect'
    | 'onAuthStateChanged'
    | 'signOut'
    | 'createUserAndSignInWithEmailAndPassword'
  >
> =>
  pipe(
    io.Do,
    io.bind('onAuthStateChangedCallback', () =>
      ioRef.newIORef<Option<OnAuthStateChangedCallback>>(option.none)
    ),
    io.map(({ onAuthStateChangedCallback }) => ({
      signInGoogleWithRedirect: signInWithRedirect(dom),
      createUserAndSignInWithEmailAndPassword: (email, _password) =>
        pipe(
          io.Do,
          io.chain(() => onAuthStateChangedCallback.read),
          ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.some(email))),
          io.chainFirst(() => dom.localStorage.setItem('auth', email))
        ),
      onAuthStateChanged: (onChangedCallback) =>
        pipe(
          io.Do,
          io.chainFirst(() => onAuthStateChangedCallback.write(option.some(onChangedCallback))),
          io.bind('lsAuth', () => dom.localStorage.getItem('auth')),
          io.chainFirst(({ lsAuth }) => onChangedCallback(lsAuth)),
          io.map(() => onAuthStateChangedCallback.write(option.none))
        ),
      signOut: pipe(
        io.Do,
        io.chain(() => onAuthStateChangedCallback.read),
        ioOption.chainFirstIOK((onChangedCallback) => onChangedCallback(option.none)),
        io.chainFirst(() => dom.localStorage.removeItem('auth'))
      ),
    }))
  );
