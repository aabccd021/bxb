import { apply, taskEither } from 'fp-ts';
import { io } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';

import type { MockableWindow } from '../../type';
import type { Stack } from '../../type';
type Type = Stack['client']['auth']['signInWithGoogleRedirect'];

const getLocationOrigin = (getWindow: IO<MockableWindow>) =>
  pipe(
    getWindow,
    io.map((win) => win.location.origin)
  );

const getLocationHref = (getWindow: IO<MockableWindow>) =>
  pipe(
    getWindow,
    io.map((win) => win.location.href)
  );

const setLocationHref = (getWindow: IO<MockableWindow>, newHref: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => {
      // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
      win.location.href = newHref;
    })
  );

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

export const signInWithGoogleRedirect: Type = (env) =>
  pipe(
    apply.sequenceS(io.Apply)({
      origin: getLocationOrigin(env.getWindow),
      href: getLocationHref(env.getWindow),
    }),
    io.map(mkRedirectUrl),
    io.chain((url) => setLocationHref(env.getWindow, url)),
    taskEither.fromIO
  );
