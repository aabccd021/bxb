import { onViewSrcCreated } from '@src/server/effect';
import { makeOnCreateTrigger } from '@src/server/library/firebase-functions';

const schema = {
  profile: {
    viewSpecs: {
      card: {
        select: {
          name: null,
        },
      },
      page: {
        select: {
          birthPlace: null,
          name: null,
        },
      },
    },
  },
};

export const a = {
  profile: {
    onSrcCreated: makeOnCreateTrigger('profile')(
      onViewSrcCreated(schema.profile)
    ),
  },
};
