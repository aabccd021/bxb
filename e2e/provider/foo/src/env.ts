import type { CI, Client } from 'masmott';

type Env = unknown;

export type FooClient = Client<Env>;
export type FooCI = CI<Env>;
