import * as client from './client';
import * as server from './server';

export const allSuites = [
  client.storage.uploadDataUrl.suite,
  client.storage.getDownloadUrl.suite,
  client.db.getDoc.suite,
  client.db.upsertDoc.suite,
  client.db.getDocWhen.suite,
  client.db.onSnapshot.suite,
  client.auth.getAuthState.suite,
  client.auth.onAuthStateChanged.suite,
  client.auth.createUserAndSignInWithEmailAndPassword.suite,
  server.db.getDoc.suite,
  server.db.upsertDoc.suite,
];

export { client, server };
