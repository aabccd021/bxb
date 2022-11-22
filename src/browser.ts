import { mkStackFromDom } from './mock';

const mkStack = mkStackFromDom(() => ({ window, localStorage }));

export const stack = mkStack();
