import type { ScopeTests } from '../../../util';
import { exportScopeTests } from '../../../util';
import * as createUserAndSignInWithEmailAndPassword from './createUserAndSignInWithEmailAndPassword';
import * as getAuthState from './getAuthState';
import * as onAuthStateChanged from './onAuthStateChanged';

export const tests = exportScopeTests({
  createUserAndSignInWithEmailAndPassword,
  getAuthState,
  onAuthStateChanged,
} as ScopeTests);
