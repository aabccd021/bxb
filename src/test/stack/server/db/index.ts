import type { ScopeTests } from '../../../util';
import { exportScopeTests } from '../../../util';
import * as getDoc from './getDoc';
import * as upsertDoc from './upsertDoc';

export const tests = exportScopeTests({ getDoc, upsertDoc } as ScopeTests);
