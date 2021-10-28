// eslint-disable-next-line no-restricted-imports
import { initializeApp } from 'firebase-admin/app';
import { NextConfig } from 'next';
import { Spec } from '../src';
import { makeFirestoreTriggers } from './make-firestore-triggers';
import { makeNextjsFunction } from './make-nextjs-func';
import { Functions } from './types';
export * from './fetching';

export function makeFunctions(conf: NextConfig, spec: Spec): Functions {
  initializeApp();
  return {
    firestore: makeFirestoreTriggers(spec),
    nextjs: makeNextjsFunction(conf),
  };
}
