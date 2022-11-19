import { io, ioRef, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';

import { Dom, OnAuthStateChangedCallback, Stack } from './type';

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

const signInWithRedirect = (dom: Dom) =>
  pipe(
    io.Do,
    io.bind('origin', () => dom.window.location.origin),
    io.bind('href', () => dom.window.location.href.get),
    io.map(mkRedirectUrl),
    io.chain(dom.window.location.href.set)
  );

const doNothing: IO<void> = () => undefined;

export const mkStack = (
  dom: Dom
): IO<Pick<Stack, 'signInGoogleWithRedirect' | 'onAuthStateChanged' | 'signOut'>> =>
  pipe(
    io.Do,
    io.bind('onAuthStateChangedCallback', () =>
      ioRef.newIORef<Option<OnAuthStateChangedCallback>>(option.none)
    ),
    io.map(({ onAuthStateChangedCallback }) => ({
      signInGoogleWithRedirect: signInWithRedirect(dom),
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
        io.bind('onChangedCallback', () => onAuthStateChangedCallback.read),
        io.chainFirst(({ onChangedCallback }) =>
          pipe(
            onChangedCallback,
            option.map((c) => c(option.none)),
            option.getOrElse(() => doNothing)
          )
        ),
        io.chainFirst(() => dom.localStorage.removeItem('auth'))
      ),
    }))
  );
