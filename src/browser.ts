import { pipe } from 'fp-ts/function';

import { mkFpDom } from './mkFp';
import { mkStackFromFpDom } from './mock';

const mkDom = () => ({ window, localStorage });

const mkStack = pipe(mkDom, mkFpDom, mkStackFromFpDom);

export const stack = mkStack();
