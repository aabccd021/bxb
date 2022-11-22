import { mkStackFromDom } from './mock';

const mkStack = mkStackFromDom(() => ({ window }));

export const stack = mkStack();
