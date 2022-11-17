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
  getItem: (browserStack) => localStorage.getItem(browserStack),
  removeItem: (key) => localStorage.removeItem(key),
};

export const browserStack = mkStack(fpLocalStorage(ls))();
