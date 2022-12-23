import { exportScopeTests } from '../../../util';
import * as getDownloadUrl from './getDownloadUrl';
import * as uploadDataUrl from './uploadDataUrl';

export const tests = exportScopeTests({
  getDownloadUrl,
  uploadDataUrl,
});
