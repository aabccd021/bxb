import { io, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { FpWindow } from './type';

export const mkFpWindow = (win: typeof window): FpWindow => ({
  location: {
    origin: () => win.location.origin,
    href: {
      get: () => win.location.href,
      set: (newHref) => () => {
        win.location.href = newHref;
      },
    },
  },
  localStorage: {
    getItem: (key) => pipe(() => win.localStorage.getItem(key), io.map(option.fromNullable)),
    setItem: (key, value) => () => win.localStorage.setItem(key, value),
    removeItem: (key) => () => win.localStorage.removeItem(key),
  },
});
