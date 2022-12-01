import * as GetDoc from './GetDoc';
import * as UpsertDoc from './UpsertDoc';
export type Scope = {
  readonly getDoc: GetDoc.Fn;
  readonly upsertDoc: UpsertDoc.Fn;
};
export { GetDoc, UpsertDoc };
