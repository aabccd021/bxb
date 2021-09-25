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
    copyOnCreate: functions.firestore
      .document(`${viewCollectionName}/{documentId}`)
      .onCreate((snapshot) => {
        const stringSFData = snapshot.data()?.[vfName];

        // type validation
        if (typeof stringSFData !== 'string') {
          return functions.logger.error('Invalid Type', {
            viewCollectionName,
            viewName,
            vfName,
            snapshot,
          });
        }

        // copy the data
        return admin
          .firestore()
          .collection(`${viewCollectionName}_${viewName}`)
          .doc(snapshot.id)
          .set(
            {
              [vfName]: stringSFData,
            },
            { merge: true }
          );
      }),
  };
}
