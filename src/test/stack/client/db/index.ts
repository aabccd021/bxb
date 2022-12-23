import { exportScopeTests } from '../../../util';
import * as getDoc from './getDoc';
import * as getDocWhen from './getDocWhen';
import * as onSnapshot from './onSnapshot';
import * as upsertDoc from './upsertDoc';

export const tests = exportScopeTests({
  getDoc,
  getDocWhen,
  onSnapshot,
  upsertDoc,
});
