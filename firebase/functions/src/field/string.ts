import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { VFTrigger } from '../type';

export type StringSFSpec = {
  readonly type: 'string';
};

export type StringVFSpec = {
  readonly type: 'string';
};

export function getStringVFTrigger({
  vfName,
  viewCollectionName,
  viewName,
}: {
  readonly vfName: string;
  readonly vfSpec: StringVFSpec;
  readonly viewCollectionName: string;
  readonly viewName: string;
}): VFTrigger {
  return {
    onSrcCreate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onCreate((snapshot) => {
        const srcData = snapshot.data()?.[vfName];

        if (typeof srcData !== 'string') {
          functions.logger.error('Invalid Type', { snapshot });
          return 1;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .set(
            {
              [vfName]: srcData,
            },
            { merge: true }
          );
      }),
    onSrcUpdate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onUpdate((change) => {
        const srcDataBefore = change.before.data()?.[vfName];
        const srcDataAfter = change.after.data()?.[vfName];

        if (
          typeof srcDataBefore !== 'string' ||
          typeof srcDataAfter !== 'string'
        ) {
          functions.logger.error('Invalid Type', { change });
          return 1;
        }

        if (srcDataBefore === srcDataAfter) {
          return 0;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(change.after.id)
          .set(
            {
              [vfName]: srcDataAfter,
            },
            { merge: true }
          );
      }),
    onSrcDelete: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onDelete((snapshot) => {
        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .delete();
      }),
  };
}
