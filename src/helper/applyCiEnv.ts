import { apply, reader } from 'fp-ts';

import type { StackType, StackWithEnv } from '..';

export const applyCiEnv = <T extends StackType>(ci: {
  readonly stack: StackWithEnv<T>['ci'];
  readonly env: T['env']['ci'];
}) => apply.sequenceS(reader.Apply)(ci.stack)(ci.env);
