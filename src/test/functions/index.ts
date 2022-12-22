import type { ScopeTests } from '../util';
import { exportScopeTests } from '../util';
import * as onAuthUserCreated from './onAuthUserCreated';
import * as onObjectCreated from './onObjectCreated';

export const tests = exportScopeTests({ onAuthUserCreated, onObjectCreated } as ScopeTests);
