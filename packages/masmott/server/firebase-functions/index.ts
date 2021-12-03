import { pipe } from 'fp-ts/lib/function';
import {
  DocumentBuilder,
  GetDocTriggerOptions,
  OnCreateTrigger,
  OnCreateTriggerHandler,
  OnDeleteTriggerHandler,
  OnUpdateTriggerHandler,
} from '../types';
import { makeDocTriggerPath, wrapChangeTriggerHandler, wrapSnapshotTriggerHandler } from '../util';
import { getFunctionsFirestore } from './non-testable';

const makeDocTrigger = (collectionName: string, options?: GetDocTriggerOptions): DocumentBuilder =>
  pipe(collectionName, makeDocTriggerPath, getFunctionsFirestore(options?.regions).document);

export const makeOnCreateTrigger = (
  collectionName: string,
  handler: OnCreateTriggerHandler
): OnCreateTrigger =>
  _.makeDocTrigger(collectionName).onCreate(wrapSnapshotTriggerHandler(handler));

export const makeOnUpdateTrigger = (collectionName: string) => (handler: OnUpdateTriggerHandler) =>
  _.makeDocTrigger(collectionName).onUpdate(wrapChangeTriggerHandler(handler));

export const toTriggerOnCollection =
  (collectionName: string) => (handler: OnDeleteTriggerHandler) =>
    _.makeDocTrigger(collectionName).onCreate(wrapSnapshotTriggerHandler(handler));

export const _ = { makeDocTrigger, makeDocTriggerPath };
