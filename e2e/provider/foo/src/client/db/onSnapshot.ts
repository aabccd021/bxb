import type { Stack } from '../../env';
type Type = Stack['client']['db']['onSnapshot'];
export const onSnapshot: Type = (_env) => (_onChangedCallback) => () => () => undefined;
