import { io, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';

import { DOM, FpDOM } from './type';

export const mkFpDom = (mkDom: IO<DOM>): FpDOM => {
  const domMapIO = <T>(f: (dom: DOM) => T) => io.map(f)(mkDom);
  const domChainIO = <T>(f: (dom: DOM) => IO<T>) => io.chain(f)(mkDom);
  return {
    window: {
      location: {
        origin: domMapIO((dom) => dom.window.location.origin),
        href: {
          get: domMapIO((dom) => dom.window.location.href),
          set: (newHref) =>
            domChainIO((dom) => () => {
              dom.window.location.href = newHref;
            }),
        },
      },
    },
    localStorage: {
      getItem: (key) =>
        domChainIO((dom) => () => pipe(key, dom.localStorage.getItem, option.fromNullable)),
      setItem: (key, value) => domChainIO((dom) => () => dom.localStorage.setItem(key, value)),
      removeItem: (key) => domChainIO((dom) => () => dom.localStorage.removeItem(key)),
    },
  };
};
