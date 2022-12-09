import * as GetDoc from './GetDoc';
import type * as GetDocWhen from './GetDocWhen';
import * as OnSnapshot from './OnSnapshot';
import * as UpsertDoc from './UpsertDoc';
export type Scope = {
  readonly getDoc: GetDoc.Fn;
  readonly upsertDoc: UpsertDoc.Fn;
  readonly onSnapshot: OnSnapshot.Fn;
  readonly getDocWhen: GetDocWhen.Fn;
};
export { GetDoc, GetDocWhen, OnSnapshot, UpsertDoc };
