import * as functions from 'firebase-functions';

export const helloWorld = functions.firestore
  .document('user/{userId}')
  .onCreate(() => functions.logger.log('yaa'));
