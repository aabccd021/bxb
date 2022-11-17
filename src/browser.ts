/* eslint-disable functional/no-return-void */
import { option } from 'fp-ts';

import { mkStack } from './mock';
import { FPLocalStorage } from './type';

type LocalStorage = {
  readonly getItem: (key: string) => string | null;
  readonly removeItem: (key: string) => void;
};

const fpLocalStorage = (ls: LocalStorage): FPLocalStorage => ({
  getItem: (key) => () => option.fromNullable(ls.getItem(key)),
  removeItem: (key) => () => ls.removeItem(key),
});

const ls: LocalStorage = {
  getItem: (key) => localStorage.getItem(key),
  removeItem: (key) => localStorage.removeItem(key),
};

export const stack = mkStack(fpLocalStorage(ls))();
