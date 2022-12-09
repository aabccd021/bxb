import { task } from 'fp-ts';

import type { Stack, StackT } from '../../env';
type Type = Stack['client']['db']['getDocWhen'];
import type { Stack as StackType } from 'masmott';

export const getDocWhen: Type =
  (_env: StackT['env']['client']) =>
  <T>(_param: StackType.client.db.GetDocWhen.Param<T>) =>
    task.of(undefined as T);
