import type { ClientWithEnv } from 'masmott';

export type FooClientEnv = {};

export type FooClientConfig = {};

export type FooClient = ClientWithEnv<FooClientEnv, FooClientConfig>;
