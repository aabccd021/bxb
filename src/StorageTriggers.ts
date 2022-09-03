import * as T from 'fp-ts/Task';

import { StorageTriggers } from '.';

const empty: Required<StorageTriggers> = {
  onUploaded: (_) => T.Do,
};

export const toRequired = (triggers: StorageTriggers): Required<StorageTriggers> => ({
  ...empty,
  ...triggers,
});
