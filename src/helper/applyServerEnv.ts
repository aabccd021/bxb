import { apply, reader } from 'fp-ts';

import type { StackType, StackWithEnv } from '..';

export const applyServerEnv = <T extends StackType>(server: {
  readonly stack: StackWithEnv<T>['server'];
  readonly env: T['env']['server'];
}) =>
  apply.sequenceS(reader.Apply)({ db: apply.sequenceS(reader.Apply)(server.stack.db) })(server.env);
