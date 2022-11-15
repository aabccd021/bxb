/* eslint-disable functional/no-return-void */
import * as mock from 'masmott/dist/es6/mock';

export const signIn =
  process.env.NODE_ENV === 'production' ? () => console.log(process.env.NODE_ENV) : mock.signIn;
