/* eslint-disable functional/no-return-void */

import { mkStack as pureMkStack } from './mock';
import { LocalStorage } from './type';

const ls: LocalStorage = {
  getItem: (key) => localStorage.getItem(key),
  removeItem: (key) => localStorage.removeItem(key),
};

export const mkStack = pureMkStack(ls);

export const stack = mkStack();
