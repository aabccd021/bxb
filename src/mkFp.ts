import { either, io, ioOption, option } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { Refinement } from 'fp-ts/Refinement';

import type { Window } from './type';

export const mkFpLocalStorage = (localStorage: Window['localStorage']) => ({
  getItem: (key: string) => pipe(() => localStorage.getItem(key), io.map(option.fromNullable)),
  setItem: (key: string, value: string) => () => localStorage.setItem(key, value),
  removeItem: (key: string) => () => localStorage.removeItem(key),
});

export const mkFpLocation = (location: Window['location']) => ({
  origin: () => location.origin,
  href: {
    get: () => location.href,
    set: (newHref: string) => () => {
      location.href = newHref;
    },
  },
});

export const mkFpWindow = (win: Window) => ({
  location: mkFpLocation(win.location),
  localStorage: mkFpLocalStorage(win.localStorage),
});

export const mkSafeLocalStorage =
  <T, K>(refinement: Refinement<unknown, T>, onFalse: (data: unknown, key: string) => K) =>
  (key: string) =>
    flow(mkFpLocalStorage, (localStorage) => ({
      setItem: (data: T) =>
        pipe(data, JSON.stringify, (typeSafeData) => localStorage.setItem(key, typeSafeData)),
      getItem: pipe(
        localStorage.getItem(key),
        ioOption.map(JSON.parse),
        ioOption.map(either.fromPredicate(refinement, (data) => onFalse(data, key))),
        io.map(option.match(() => either.right(option.none), either.map(option.some)))
      ),
    }));
