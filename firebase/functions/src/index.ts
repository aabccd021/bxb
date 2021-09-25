import * as admin from 'firebase-admin';
import { getStringVFTrigger, StringSFSpec, StringVFSpec } from './field/string';
import { getTrigger } from './get-trigger';

admin.initializeApp();

export type SFSpec = StringSFSpec;
export type VFSpec = StringVFSpec;

export const triggers = getTrigger<SFSpec, VFSpec>({
  config: {
    user: {
      source: {
        id: {
          type: 'string',
        },
      },
      view: {
        card: {
          id: {
            type: 'string',
          },
        },
      },
    },
  },
  getVfTrigger: ({ vfName, vfSpec, viewCollectionName, viewName }) => {
    return getStringVFTrigger({ vfName, vfSpec, viewCollectionName, viewName });
  },
});
