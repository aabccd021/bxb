import type { ClientWithEnv } from 'masmott';

export type FooClientEnv = Record<string, unknown>;

export type FooClientConfig = Record<string, unknown>;

export type FooClient = ClientWithEnv<FooClientEnv, FooClientConfig>;
