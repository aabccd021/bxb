import type { Stack } from '../../env';

type Type = Stack['client']['auth']['onAuthStateChanged'];

export const onAuthStateChanged: Type = (_env) => (_p) => () => () => undefined;
