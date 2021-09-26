import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { GetVFTriggerContext, VFTrigger } from '../type';

export type RefSFSpec = {
  readonly type: 'ref';
  readonly refCollection: string;
};

export type RefVFSpec = {
  readonly type: 'ref';
  readonly select: string;
};

export function getRefVFTrigger(
  { viewCollectionName, vfName, viewName }: GetVFTriggerContext,
  { select: srcFieldName }: RefVFSpec
): VFTrigger {
  return {
    onSrcCreate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onCreate((snapshot) => {
        const srcData = snapshot.data()?.[srcFieldName];

        if (typeof srcData !== 'string') {
          functions.logger.error('Invalid Type', { snapshot });
          return 0;
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
        const srcDataBefore = change.before.data()?.[srcFieldName];
        const srcDataAfter = change.after.data()?.[srcFieldName];

        if (
          typeof srcDataBefore !== 'string' ||
          typeof srcDataAfter !== 'string'
        ) {
          functions.logger.error('Invalid Type', { change });
          return 0;
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
      .onDelete((snapshot) =>
        admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .delete()
      ),
  };
}
