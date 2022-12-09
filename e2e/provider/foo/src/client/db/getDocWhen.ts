import { task } from 'fp-ts';

import type { Param } from '../../../type/client/db/GetDocWhen';
import type { Stack } from '../../type';
type Type = Stack['client']['db']['getDocWhen'];

export const getDocWhen: Type =
  (_env) =>
  <T>(_param: Param<T>) =>
    task.of(undefined as T);
