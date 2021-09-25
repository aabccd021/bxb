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
    onSourceCreate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onCreate((snapshot) => {
        const sourceData = snapshot.data()?.[vfName];

        if (typeof sourceData !== 'string') {
          functions.logger.error('Invalid Type', {
            viewCollectionName,
            viewName,
            vfName,
            snapshot,
          });
          return 1;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .set(
            {
              [vfName]: sourceData,
            },
            { merge: true }
          );
      }),
    onSourceUpdate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onUpdate((change) => {
        const sourceDataBefore = change.before.data()?.[vfName];

        if (typeof sourceDataBefore !== 'string') {
          functions.logger.error('Invalid Type', {
            viewCollectionName,
            viewName,
            vfName,
            change,
          });
          return 1;
        }

        const sourceDataAfter = change.after.data()?.[vfName];

        if (typeof sourceDataAfter !== 'string') {
          functions.logger.error('Invalid Type', {
            viewCollectionName,
            viewName,
            vfName,
            change,
          });
          return 1;
        }

        if (sourceDataBefore === sourceDataAfter) {
          return 0;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(change.after.id)
          .set(
            {
              [vfName]: sourceDataAfter,
            },
            { merge: true }
          );
      }),
    onSourceDelete: functions.firestore
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
