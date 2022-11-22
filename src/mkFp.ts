import { io, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';

import { FpWindow } from './type';

export const mkFpWindow = (mkDom: IO<typeof window>): FpWindow => ({
  location: {
    origin: pipe(
      mkDom,
      io.map((window) => window.location.origin)
    ),
    href: {
      get: pipe(
        mkDom,
        io.map((window) => window.location.href)
      ),
      set: (newHref) =>
        pipe(
          mkDom,
          io.chain((window) => () => {
            window.location.href = newHref;
          })
        ),
    },
  },
  localStorage: {
    getItem: (key) =>
      pipe(
        mkDom,
        io.chain((window) => () => window.localStorage.getItem(key)),
        io.map(option.fromNullable)
      ),
    setItem: (key, value) =>
      pipe(
        mkDom,
        io.chain((window) => () => window.localStorage.setItem(key, value))
      ),
    removeItem: (key) =>
      pipe(
        mkDom,
        io.chain((window) => () => window.localStorage.removeItem(key))
      ),
  },
});
