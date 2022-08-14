import * as IO from 'fp-ts/IO';

export type State<T> = {
  readonly set: (newState: T) => IO.IO<void>;
  readonly get: IO.IO<T>;
};

export const makeState = <T>(initialState: T): State<T> => {
  let state: T = initialState;

  return {
    set: (newState: T) => () => {
      state = newState;
    },
    get: () => state,
  };
};
