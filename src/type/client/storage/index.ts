import * as GetDownloadUrl from './GetDownloadUrl';
import * as UploadDataUrl from './UploadDataUrl';
import * as UploadDataUrlAwaitFunctions from './UploadDataUrlAwaitFunctions';
export type Scope = {
  readonly uploadDataUrlAwaitFunctions: UploadDataUrlAwaitFunctions.Fn;
  readonly uploadDataUrl: UploadDataUrl.Fn;
  readonly getDownloadUrl: GetDownloadUrl.Fn;
};
export { GetDownloadUrl, UploadDataUrl, UploadDataUrlAwaitFunctions };
