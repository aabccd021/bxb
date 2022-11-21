/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */

import { option } from 'fp-ts';

import { mkStack } from './mock';
import { Dom } from './type';

const dom: Dom = {
  window: {
    location: {
      origin: () => window.location.origin,
      href: {
        get: () => window.location.href,
        set: (newHref) => () => {
          window.location.href = newHref;
        },
      },
    },
  },
  localStorage: {
    getItem: (key) => () => option.fromNullable(localStorage.getItem(key)),
    setItem: (key, value) => () => localStorage.setItem(key, value),
    removeItem: (key) => () => localStorage.removeItem(key),
  },
};

export const stack = mkStack(dom)();
