import * as GetDoc from './GetDoc';
import * as OnSnapshot from './OnSnapshot';
import * as UpsertDoc from './UpsertDoc';
export type Scope = {
  readonly getDoc: GetDoc.Fn;
  readonly upsertDoc: UpsertDoc.Fn;
  readonly onSnapshot: OnSnapshot.Fn;
};
export { GetDoc, OnSnapshot, UpsertDoc };
