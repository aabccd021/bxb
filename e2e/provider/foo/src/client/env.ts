import type { Client } from 'masmott';

export type FooClientEnv = Record<string, unknown>;

export type FooClientConfig = Record<string, unknown>;

export type FooClient = Client<FooClientEnv, FooClientConfig>;
