import { io, ioRef, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';

import { FPLocalStorage, LocalStorage, OnAuthStateChangedCallback, Stack } from './type';
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */
const signInWithRedirect = () => {
  const url = new URL(`${window.location.origin}/__masmott__/signInWithRedirect`);
  url.searchParams.append('redirectUrl', window.location.href);
  window.location.href = url.toString();
};

export const signInGoogleWithRedirect: IO<void> = signInWithRedirect;

const fpLocalStorage = (ls: LocalStorage): FPLocalStorage => ({
  getItem: (key) => () => option.fromNullable(ls.getItem(key)),
  removeItem: (key) => () => ls.removeItem(key),
});

export const mkStack = (
  rawLs: LocalStorage
): IO<Pick<Stack, 'signInGoogleWithRedirect' | 'onAuthStateChanged' | 'signOut'>> => {
  const ls = fpLocalStorage(rawLs);
  return pipe(
    io.Do,
    io.bind('onAuthStateChangedCallback', () =>
      ioRef.newIORef<Option<OnAuthStateChangedCallback>>(option.none)
    ),
    io.map(({ onAuthStateChangedCallback }) => ({
      signInGoogleWithRedirect,
      onAuthStateChanged: (onChangedCallback) =>
        pipe(
          io.Do,
          io.chainFirst(() => onAuthStateChangedCallback.write(option.some(onChangedCallback))),
          io.bind('lsAuth', () => ls.getItem('auth')),
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
            option.getOrElse(() => () => {})
          )
        ),
        io.chainFirst(() => ls.removeItem('auth'))
      ),
    }))
  );
};
