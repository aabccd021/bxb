import { io, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';

import { DOM, FpDOM } from './type';

export const mkFpDom = (mkDom: IO<DOM>): FpDOM => ({
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
