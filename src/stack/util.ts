import { either, io, ioOption, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Refinement } from 'fp-ts/Refinement';

import type { MockableWindow } from './type';

export const setItem = (getWindow: IO<MockableWindow>, key: string, value: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => win.localStorage.setItem(key, value))
  );

export const removeItem = (getWindow: IO<MockableWindow>, key: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => win.localStorage.removeItem(key))
  );

export const getItem = (getWindow: IO<MockableWindow>, key: string) =>
  pipe(
    getWindow,
    io.map((win) => win.localStorage.getItem(key)),
    io.map(option.fromNullable)
  );

export const getObjectItem = <T, K>(
  getWindow: IO<MockableWindow>,
  key: string,
  refinement: Refinement<unknown, T>,
  onFalse: (data: unknown) => K
) =>
  pipe(
    getItem(getWindow, key),
    ioOption.map(JSON.parse),
    ioOption.map(either.fromPredicate(refinement, onFalse)),
    io.map(option.match(() => either.right(option.none), either.map(option.some)))
  );

export const setObjectItem = <T>(getWindow: IO<MockableWindow>, key: string, data: T) =>
  pipe(data, JSON.stringify, (typeSafeData) => setItem(getWindow, key, typeSafeData));
