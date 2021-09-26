import * as admin from 'firebase-admin';
import { JoinVFSpec } from './field/join';
import { RefSFSpec } from './field/ref';
import { StringSFSpec, StringVFSpec } from './field/string';
import { getTrigger } from './get-trigger';

admin.initializeApp();

export type SFSpec = StringSFSpec | RefSFSpec;
export type VFSpec = StringVFSpec | JoinVFSpec;

export const triggers = getTrigger({
  user: {
    src: {
      id: {
        type: 'string',
      },
      username: {
        type: 'string',
      },
    },
    view: {
      card: {
        selectedFieldNames: ['id'],
      },
    },
  },
  tweet: {
    src: {
      text: {
        type: 'string',
      },
      owner: {
        type: 'ref',
        collection: 'user',
      },
    },
    view: {
      card: {
        selectedFieldNames: ['text'],
        joinSpecs: [
          {
            refCollectionName: 'user',
            refFieldName: 'owner',
            selectedFieldNames: ['username'],
          },
        ],
      },
    },
  },
});
