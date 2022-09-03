import { MakeTriggers } from '.';

const empty: Required<MakeTriggers> = {
  storage: () => ({}),
  db: () => ({}),
};

export const toRequired = (triggers: MakeTriggers): Required<MakeTriggers> => ({
  ...empty,
  ...triggers,
});
