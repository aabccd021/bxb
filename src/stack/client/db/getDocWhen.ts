import { augmentCapability } from '../../..';
import type { Stack } from '../../type';
import { onSnapshot } from './onSnapshot';
type Type = Stack['client']['db']['getDocWhen'];

export const getDocWhen: Type = augmentCapability.getDocWhen.fromOnSnapshot(onSnapshot);
