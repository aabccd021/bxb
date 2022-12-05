import * as GetDownloadUrl from './GetDownloadUrl';
import * as UploadDataUrl from './UploadDataUrl';
export type Scope = {
  readonly uploadDataUrl: UploadDataUrl.Fn;
  readonly getDownloadUrl: GetDownloadUrl.Fn;
};
export { GetDownloadUrl, UploadDataUrl };
