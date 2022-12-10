import { apply, reader } from 'fp-ts';

import type { StackType, StackWithEnv } from '..';

export const applyClientEnv = <T extends StackType>(client: {
  readonly stack: StackWithEnv<T>['client'];
  readonly env: T['env']['client'];
}) =>
  apply.sequenceS(reader.Apply)({
    auth: apply.sequenceS(reader.Apply)(client.stack.auth),
    db: apply.sequenceS(reader.Apply)(client.stack.db),
    storage: apply.sequenceS(reader.Apply)(client.stack.storage),
  })(client.env);
