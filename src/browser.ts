/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */

import { option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';

import { mkStackFromDom } from './mock';
import { Dom } from './type';

type Dum = {
  readonly window: typeof window;
  readonly localStorage: typeof localStorage;
};

const mkFpDom = (dum: IO<Dum>): Dom => ({
  window: {
    location: {
      origin: () => dum().window.location.origin,
      href: {
        get: () => dum().window.location.href,
        set: (newHref) => () => {
          dum().window.location.href = newHref;
        },
      },
    },
  },
  localStorage: {
    getItem: (key) => () => option.fromNullable(dum().localStorage.getItem(key)),
    setItem: (key, value) => () => dum().localStorage.setItem(key, value),
    removeItem: (key) => () => dum().localStorage.removeItem(key),
  },
});

const mkDom = () => ({ window, localStorage });

const mkStack = pipe(mkDom, mkFpDom, mkStackFromDom);

export const stack = mkStack();
