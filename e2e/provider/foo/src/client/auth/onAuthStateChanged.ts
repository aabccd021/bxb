import { FooClient } from '../env';

type Type = FooClient['auth']['onAuthStateChanged'];

export const onAuthStateChanged: Type = (_env) => (_p) => () => () => undefined;
