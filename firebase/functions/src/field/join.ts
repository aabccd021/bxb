import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GetVFTriggerContext, VFTrigger } from '../type';

export type JoinVFSpec = {
  readonly type: 'join';
  readonly from: string;
  readonly join_on: string;
  readonly select: string;
  readonly data_type: 'string';
};

export function getJoinVFTrigger(
  { viewCollectionName, vfName, viewName }: GetVFTriggerContext,
  {
    from: refCollectionName,
    select: selectedFieldName,
    join_on: refFieldName,
    data_type: expectedDataType,
  }: JoinVFSpec
): VFTrigger {
  return {
    onSrcCreate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onCreate(async (snapshot) => {
        const refId = snapshot.data()?.[refFieldName];

        if (typeof refId !== 'string') {
          functions.logger.error('Invalid Type', { snapshot });
          return 0;
        }

        const refDoc = await admin
          .firestore()
          .collection(refCollectionName)
          .doc(refId)
          .get();

        const refData = refDoc.data()?.[selectedFieldName];

        if (expectedDataType === 'string' && typeof refData !== 'string') {
          functions.logger.error('Invalid Type', { refDoc });
          return 0;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .set(
            {
              [vfName]: refData,
            },
            { merge: true }
          );
      }),
    onSrcUpdate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onUpdate(async (change) => {
        const refIdBefore = change.before.data()?.[refFieldName];
        const refIdAfter = change.after.data()?.[refFieldName];

        if (typeof refIdBefore !== 'string' || typeof refIdAfter !== 'string') {
          functions.logger.error('Invalid Type', { change });
          return 0;
        }

        if (refIdBefore === refIdAfter) {
          return 0;
        }

        const refId = refIdAfter;

        const refDoc = await admin
          .firestore()
          .collection(refCollectionName)
          .doc(refId)
          .get();

        const refData = refDoc.data()?.[selectedFieldName];

        if (expectedDataType === 'string' && typeof refData !== 'string') {
          functions.logger.error('Invalid Type', { refDoc });
          return 0;
        }

        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(change.after.id)
          .set(
            {
              [vfName]: refData,
            },
            { merge: true }
          );
      }),
    onRefUpdate: functions.firestore
      .document(`user/{documentId}`)
      .onUpdate(async (change) => {
        const refDataBefore = change.before.data()?.[selectedFieldName];
        const refDataAfter = change.after.data()?.[selectedFieldName];

        if (
          expectedDataType === 'string' &&
          (typeof refDataBefore !== 'string' ||
            typeof refDataAfter !== 'string')
        ) {
          functions.logger.error('Invalid Type', { change });
          return 0;
        }

        if (refDataBefore === refDataAfter) {
          return 0;
        }

        const referDocs = await admin
          .firestore()
          .collection(viewCollectionName)
          .where(refFieldName, '==', change.after.id)
          .get();

        const referDocsUpdates = referDocs.docs.map(({ ref }) =>
          ref.set({ [vfName]: refDataAfter })
        );

        return Promise.allSettled(referDocsUpdates);
      }),
  };
}
