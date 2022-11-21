/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */

import { io, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';

import { mkStackFromFpDom } from './mock';
import { Dom } from './type';

type DOM = {
  readonly window: typeof window;
  readonly localStorage: typeof localStorage;
};

const mkFpDom = (mkDom: IO<DOM>): Dom => ({
  window: {
    location: {
      origin: pipe(
        mkDom,
        io.map((dom) => dom.window.location.origin)
      ),
      href: {
        get: pipe(
          mkDom,
          io.map((dom) => dom.window.location.href)
        ),
        set: (newHref) =>
          pipe(
            mkDom,
            io.chain((dom) => () => {
              dom.window.location.href = newHref;
            })
          ),
      },
    },
  },
  localStorage: {
    getItem: (key) =>
      pipe(
        mkDom,
        io.chain((dom) => () => dom.localStorage.getItem(key)),
        io.map(option.fromNullable)
      ),
    setItem: (key, value) =>
      pipe(
        mkDom,
        io.chain((dom) => () => dom.localStorage.setItem(key, value))
      ),
    removeItem: (key) =>
      pipe(
        mkDom,
        io.chain((dom) => () => dom.localStorage.removeItem(key))
      ),
  },
});

const mkDom = () => ({ window, localStorage });

const mkStack = pipe(mkDom, mkFpDom, mkStackFromFpDom);

export const stack = mkStack();
