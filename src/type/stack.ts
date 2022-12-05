import type * as ci from './ci';
import type * as client from './client';
import type * as server from './server';

export type Type = {
  readonly ci: ci.Type;
  readonly client: client.Type;
  readonly server: server.Type;
};

export { ci, client, server };
