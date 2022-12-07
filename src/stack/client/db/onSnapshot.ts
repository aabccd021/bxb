import type { Stack } from '../../type';
type Type = Stack['client']['db']['onSnapshot'];

export const onSnapshot: Type = (_env) => (_onChangedCallback) => () => () => undefined;
