import * as ci from './ci';
import * as client from './client';

export type Type = {
  readonly ci: ci.Type;
  readonly client: client.Type;
};

export { ci, client };
