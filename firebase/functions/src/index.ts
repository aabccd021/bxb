import assertNever from 'assert-never';
import * as admin from 'firebase-admin';
import { getJoinVFTrigger, JoinVFSpec } from './field/join';
import { RefSFSpec } from './field/ref';
import { getStringVFTrigger, StringSFSpec, StringVFSpec } from './field/string';
import { getTrigger } from './get-trigger';

admin.initializeApp();

export type SFSpec = StringSFSpec | RefSFSpec;
export type VFSpec = StringVFSpec | JoinVFSpec;

export const triggers = getTrigger<SFSpec, VFSpec>({
  collection: {
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
          id: {
            type: 'string',
            select: 'id',
          },
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
          text: {
            type: 'string',
            select: 'text',
          },
          owner_username: {
            type: 'join',
            from: 'user',
            join_on: 'owner',
            select: 'username',
            data_type: 'string',
          },
        },
      },
    },
  },
  getVfTrigger: (context, vfSpec) => {
    if (vfSpec.type === 'string') {
      return getStringVFTrigger(context, vfSpec);
    }
    if (vfSpec.type === 'join') {
      return getJoinVFTrigger(context, vfSpec);
    }
    assertNever(vfSpec);
  },
});
