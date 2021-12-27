/* eslint-disable functional/no-throw-statement */
/* eslint-disable functional/no-conditional-statement */
import * as E from 'fp-ts/Either';
import { identity } from 'fp-ts/function';

export const stringify =
  (space: number) =>
  <A>(a: A): E.Either<unknown, string> =>
    E.tryCatch(() => {
      const s = JSON.stringify(a, undefined, space);
      if (typeof s !== 'string') {
        throw new Error('Converting unsupported structure to JSON');
      }
      return s;
    }, identity);
