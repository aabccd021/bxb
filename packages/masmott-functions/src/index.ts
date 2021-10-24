export * from './type';
// eslint-disable-next-line no-restricted-imports
import { initializeApp } from 'firebase-admin/app';
import { NextConfig } from 'next';
import { makeFirestoreTriggers } from './make-firestore-triggers';
import { makeNextjsFunction } from './make-nextjs-func';
import { Functions, Spec } from './type';

export function makeFunctions(conf: NextConfig, spec: Spec): Functions {
  initializeApp();
  return {
    firestore: makeFirestoreTriggers(spec),
    nextjs: makeNextjsFunction(conf),
  };
}
