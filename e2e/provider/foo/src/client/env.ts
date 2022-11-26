import type { Client } from 'masmott';

export type FooProviderClient = {
  readonly env: unknown;
  readonly config: unknown;
};

export type FooClient = Client<FooProviderClient>;
