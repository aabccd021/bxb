import { task } from 'fp-ts';

import { StorageTriggers } from '.';

const empty: Required<StorageTriggers> = {
  onUploaded: (_) => task.Do,
};

export const toRequired = (triggers: StorageTriggers): Required<StorageTriggers> => ({
  ...empty,
  ...triggers,
});
