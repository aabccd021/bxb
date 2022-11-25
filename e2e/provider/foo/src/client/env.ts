import { ClientWithEnv } from 'masmott';

export type FooClientEnv = {};

export type FooClient = ClientWithEnv<FooClientEnv>;
