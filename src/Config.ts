import { Config } from '.';

const empty: Required<Config> = {
  storage: () => ({}),
  db: () => ({}),
};

export const toRequired = (triggers: Config): Required<Config> => ({
  ...empty,
  ...triggers,
});
