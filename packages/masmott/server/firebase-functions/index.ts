import { pipe } from 'fp-ts/lib/function';
import {
  DocumentBuilder,
  GetDocTriggerOptions,
  OnCreateTrigger,
  OnCreateTriggerHandler,
  OnDeleteTrigger,
  OnDeleteTriggerHandler,
  OnUpdateTrigger,
  OnUpdateTriggerHandler,
} from '../types';
import { makeDocTriggerPath, wrapChangeTriggerHandler, wrapSnapshotTriggerHandler } from '../util';
import { getFunctionsFirestore } from './non-testable';

/**
 * Type safe and convenience firebase-functions wrapper
 */

const makeDocTrigger = (collectionName: string, options?: GetDocTriggerOptions): DocumentBuilder =>
  pipe(collectionName, makeDocTriggerPath, getFunctionsFirestore(options?.regions).document);

export const makeOnCreateTrigger = (
  collectionName: string,
  handler: OnCreateTriggerHandler
): OnCreateTrigger =>
  _.makeDocTrigger(collectionName).onCreate(wrapSnapshotTriggerHandler(handler));

export const makeOnUpdateTrigger = (
  collectionName: string,
  handler: OnUpdateTriggerHandler
): OnUpdateTrigger => _.makeDocTrigger(collectionName).onUpdate(wrapChangeTriggerHandler(handler));

export const makeOnDeleteTrigger = (
  collectionName: string,
  handler: OnDeleteTriggerHandler
): OnDeleteTrigger =>
  _.makeDocTrigger(collectionName).onCreate(wrapSnapshotTriggerHandler(handler));

export const _ = { makeDocTrigger, makeDocTriggerPath };
