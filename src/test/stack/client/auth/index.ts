import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';

import type { Test } from '../../../util';
import { exportScopeTests } from '../../../util';
import * as createUserAndSignInWithEmailAndPassword from './createUserAndSignInWithEmailAndPassword';
import * as getAuthState from './getAuthState';
import * as onAuthStateChanged from './onAuthStateChanged';

export const tests = exportScopeTests({
  createUserAndSignInWithEmailAndPassword,
  getAuthState,
  onAuthStateChanged,
} as ReadonlyRecord<string, ReadonlyRecord<string, Test>>);
